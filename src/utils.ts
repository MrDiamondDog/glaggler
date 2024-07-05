import { ButtonStyles, ComponentInteraction, CreateMessageOptions, Message, NullablePartialEmoji } from "oceanic.js";

import { Glaggler } from "./client";
import { button, row } from "./utils/components";

export function reply(msg: Message, opts: CreateMessageOptions | string): Promise<Message> {
    if (typeof opts === "string")
        opts = {
            content: opts
        };

    return msg.client.rest.channels.createMessage(msg.channelID, {
        ...opts,
        messageReference: {
            messageID: msg.id,
            channelID: msg.channelID,
            guildID: msg.guildID!
        }
    });
}

export function edit(message: string, channel: string, opts: CreateMessageOptions | string): Promise<Message> {
    if (typeof opts === "string")
        opts = {
            content: opts
        };

    return Glaggler.rest.channels.editMessage(channel, message, opts);
}

export function send(channelID: string, opts: CreateMessageOptions | string): Promise<Message> {
    if (typeof opts === "string")
        opts = {
            content: opts
        };

    return Glaggler.rest.channels.createMessage(channelID, opts);
}

export const paginatedMessages: { id: string; rows: string[]; page: number; rowsPerPage: number; messageId: string; channelId: string; header: string; }[] = [];

export async function paginatedMessage(channelId: string, header: string, rows: string[], rowsPerPage = 10): Promise<string> {
    const id = Math.random().toString(36).substring(7);

    const originalHeader = header;

    const lastPage = Math.ceil(rows.length / rowsPerPage) - 1;

    header = header.replaceAll("{{page}}", "1");
    header = header.replaceAll("{{max_pages}}", (lastPage + 1) + "");

    const message = await send(channelId, {
        content: header + "\n\n" + rows.slice(0, rowsPerPage).join("\n"),
        components: lastPage === 0 ? undefined : [
            row(
                button(`p-first_${id}`, "<<", ButtonStyles.SECONDARY, true),
                button(`p-prev_${id}`, "<", ButtonStyles.PRIMARY, true),
                button(`p-next_${id}`, ">", ButtonStyles.PRIMARY, lastPage === 0),
                button(`p-last_${id}`, ">>", ButtonStyles.SECONDARY, lastPage === 0)
            )
        ]
    });

    paginatedMessages.push({ id, rows, page: 0, rowsPerPage, messageId: message.id, channelId, header: originalHeader });
    return id;
}

export function updatePaginatedMessage(id: string, newPage: number) {
    const paginatedMessage = paginatedMessages.find(m => m.id === id);
    if (!paginatedMessage) return;

    const start = newPage * paginatedMessage.rowsPerPage;
    const end = start + paginatedMessage.rowsPerPage;

    const lastPage = Math.ceil(paginatedMessage.rows.length / paginatedMessage.rowsPerPage) - 1;

    paginatedMessage.page = newPage;

    let { header } = paginatedMessage;
    header = header.replaceAll("{{page}}", (newPage + 1) + "");
    header = header.replaceAll("{{max_pages}}", (lastPage + 1) + "");

    edit(paginatedMessage.messageId, paginatedMessage.channelId, {
        content: header + "\n\n" + paginatedMessage.rows.slice(start, end).join("\n"),
        components: [
            row(
                button(`p-first_${id}`, "<<", ButtonStyles.SECONDARY, newPage === 0),
                button(`p-prev_${id}`, "<", ButtonStyles.PRIMARY, newPage === 0),
                button(`p-next_${id}`, ">", ButtonStyles.PRIMARY, newPage === lastPage),
                button(`p-last_${id}`, ">>", ButtonStyles.SECONDARY, newPage === lastPage)
            )
        ]
    });
}

Glaggler.on("interactionCreate", async int => {
    if (!int.isComponentInteraction()) return;

    const interaction = int as ComponentInteraction;
    const id = interaction.data.customID;

    if (!id.startsWith("p-")) return;

    interaction.deferUpdate();

    const [action, pid] = id.split("p-")[1].split("_");

    const paginatedMessage = paginatedMessages.find(m => m.id === pid);
    if (!paginatedMessage) return;

    let newPage = paginatedMessage.page;
    const lastPage = Math.ceil(paginatedMessage.rows.length / paginatedMessage.rowsPerPage) - 1;
    switch (action) {
        case "first":
            newPage = 0;
            break;
        case "prev":
            newPage--;
            break;
        case "next":
            newPage++;
            break;
        case "last":
            newPage = lastPage;
            break;
    }

    if (newPage < 0) newPage = 0;
    if (newPage > lastPage) newPage = lastPage;

    updatePaginatedMessage(pid, newPage);
});

export async function deleteMsg(messageId: string, channelId: string) {
    return Glaggler.rest.channels.deleteMessage(channelId, messageId);
}

export async function upload(channelID: string, filename: string, data: string | Buffer, message?: CreateMessageOptions, method: "POST" | "PATCH" = "POST", messageId?: string): Promise<Message> {
    const body = new FormData();
    body.append("payload_json", JSON.stringify({
        attachments: [{
            filename,
            id: 0
        }],
        ...message
    }));
    const blob = new Blob([data], { type: "text/plain" });
    body.append("files[0]", blob, filename);

    // manually send fetch request to upload file
    return await fetch(`https://discord.com/api/v9/channels/${channelID}/messages${method === "PATCH" ? `/${messageId}` : ""}`, {
        method: method,
        headers: {
            Authorization: "Bot " + process.env.DISCORD_TOKEN,
        },
        body
    }).then(async res => {
        if (!res.ok) {
            throw new Error(`Failed to upload file: ${res.status} ${res.statusText} ${JSON.stringify(await res.json())}`);
        }

        return res.json();
    }) as Message;
}

export const ZWSP = "\u200B";
export const EMPTY = "\u2800";
export const codeblock = (s: string, lang = "") => `\`\`\`${lang}\n${s.replaceAll?.("`", "`" + ZWSP) || s || "No output"}\n\`\`\``;

export function pluralise(amount: number, singular: string, plural = singular + "s") {
    return amount === 1 ? `${amount} ${singular}` : `${amount} ${plural}`;
}

export function stripIndent(strings: TemplateStringsArray, ...values: any[]) {
    const string = String.raw({ raw: strings }, ...values);

    const match = string.match(/^[ \t]*(?=\S)/gm);
    if (!match) return string.trim();

    const minIndent = match.reduce((r, a) => Math.min(r, a.length), Infinity);
    return string.replace(new RegExp(`^[ \\t]{${minIndent}}`, "gm"), "").trim();
}

export function toTitle(s: string) {
    return s
        .split(" ")
        .map(w => w[0].toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
}

export function snakeToTitle(s: string) {
    return s
        .split("_")
        .map(w => w[0].toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
}

export function toInlineCode(s: string) {
    return "``" + ZWSP + s.replaceAll("`", ZWSP + "`" + ZWSP) + ZWSP + "``";
}

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function emoji(emoji: NullablePartialEmoji) {
    return emoji.id ? `<:${emoji.name}:${emoji.id}>` : emoji.name;
}

export function seededRandom(seed: number) {
    const m = 0x80000000; // 2^31
    const a = 1103515245;
    const c = 12345;

    let state = seed || Math.floor(Math.random() * (m - 1));

    state = (a * state + c) % m;
    return state / (m - 1);
}

export function secondsToTime(s: number) {
    const hours = Math.floor(s / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const seconds = Math.floor(s % 60);

    return `${hours ? hours + ":" : ""}${minutes}:${String(seconds).padStart(2, "0")}`;
}
