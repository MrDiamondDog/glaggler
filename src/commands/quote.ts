import { defineCommand } from "../command";
import { reply } from "../utils";

const quotesChannel = "1095827564720824400";
const quoteRe = /("|'|«|‘|“|`)(.+)("|'|»|’|”|`)\s*-\s*(.+)/;

defineCommand({
    name: "quote",
    aliases: ["q"],
    description: "Get a random quote",
    async execute(msg) {
        const messages = await msg.client.rest.channels.getMessages(quotesChannel, { limit: Infinity });

        const quotes = messages.filter(m => m.content.match(quoteRe));

        if (!quotes.length) {
            return reply(msg, "No quotes found");
        }

        const quote = quotes[Math.floor(Math.random() * quotes.length)];
        return reply(msg, quote.content);
    },
});
