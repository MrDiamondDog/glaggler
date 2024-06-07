import { Glaggler, PREFIX } from "../client";
import { defineCommand } from "../command";
import { cacheMessages, generalChannel, getMessages, josh } from "../modules/josh";
import { edit, reply } from "../utils";

defineCommand({
    name: "josh",
    description: "Uses the Markov chain to generate a sentence",
    usage: "josh [index|prompt]",

    async execute(msg, ...args) {
        if (msg.channel!.id !== generalChannel) {
            reply(msg, "This command can only be used in the general channel.");
            return;
        }

        if (args?.[0] === "index") {
            if (msg.author.id !== "523338295644782592") {
                reply(msg, "You don't have permission to index messages.");
                return;
            }

            const replyMsg = await reply(msg, "Indexing past messages...");

            let messages = await Glaggler.rest.channels.getMessages(generalChannel, { limit: Infinity });
            messages = messages.filter(m => m.author.id !== Glaggler.user.id && m.content.length > 0 && !m.content.startsWith(PREFIX));

            edit(replyMsg.id, msg.channelID, `Indexed ${messages.length} messages.`);
            cacheMessages(messages.map(m => m.content));

            return;
        }

        const messages = getMessages();
        if (messages.length === 0) {
            reply(msg, "No messages have been indexed yet.");
            return;
        }

        reply(msg, josh(messages));
    },
});
