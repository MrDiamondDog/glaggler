import { CreateMessageOptions, Message } from "oceanic.js";

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

export function send(channelID: string, opts: CreateMessageOptions | string): Promise<Message> {
    if (typeof opts === "string")
        opts = {
            content: opts
        };

    return Glaggler.rest.channels.createMessage(channelID, opts);
}

export async function upload(channelID: string, data: string, filename: string) {
    const body = new FormData();
    body.append("payload_json", JSON.stringify({
        attachments: [{
            filename,
            id: 0
        }]
    }));
    const blob = new Blob([data], { type: "text/plain" });
    body.append("files[0]", blob, filename);

    // manually send fetch request to upload file
    return await fetch(`https://discord.com/api/v9/channels/${channelID}/messages`, {
        method: "POST",
        headers: {
            Authorization: "Bot " + process.env.TOKEN,
        },
        body
    }).then(async res => {
        if (!res.ok) {
            throw new Error(`Failed to upload file: ${res.status} ${res.statusText} ${JSON.stringify(await res.json())}`);
        }
    });
}

export const ZWSP = "\u200B";
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
