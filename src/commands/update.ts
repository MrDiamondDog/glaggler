import { execSync } from "child_process";
import fs from "fs";

import { defineCommand } from "../command";
import { codeblock, reply } from "../utils";

defineCommand({
    name: "update",
    description: "Update the bot",

    async execute(msg) {
        if (msg.author.id !== "523338295644782592")
            return reply(msg, "You are not allowed to run this command.");

        try {
            if (execSync("git pull").toString().includes("Already up to date."))
                return reply(msg, {
                    content: "Already up to date"
                });

            await reply(msg, {
                content: "Updated!! Now restarting..."
            });

            fs.writeFileSync("./data/assets/restart-notif-channel", msg.channelID);

            process.exit(0);
        } catch (e) {
            console.error(e);
            reply(msg, {
                content: "Failed to update: " + codeblock(String(e), "")
            });
        }
    },
});
