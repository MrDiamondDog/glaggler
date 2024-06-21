import { defineCommand } from "../command";
import { reply } from "../utils";

defineCommand({
    name: "ping",
    description: "Ping the bot",
    usage: "ping",
    async execute(msg) {
        reply(msg, ":cricket:");
    },
});
