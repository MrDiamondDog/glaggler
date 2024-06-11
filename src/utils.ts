import { CreateMessageOptions, Message, NullablePartialEmoji } from "oceanic.js";

import { Glaggler } from "./client";

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

export async function upload(channelID: string, data: string | Buffer, message?: CreateMessageOptions, method: "POST" | "PATCH" = "POST", messageId?: string): Promise<Message> {
    const body = new FormData();
    body.append("payload_json", JSON.stringify({
        attachments: [{
            filename: "upload.png",
            id: 0
        }],
        ...message
    }));
    const blob = new Blob([data], { type: "text/plain" });
    body.append("files[0]", blob, "upload.png");

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
