import { execSync } from "child_process";
import fs from "fs";

import { defineCommand } from "../command";
import { codeblock, reply } from "../utils";

defineCommand({
    name: "update",
    description: "Update the bot",
    usage: "update [install]",

    async execute(msg, install) {
        if (msg.author.id !== "523338295644782592")
            return reply(msg, "You are not allowed to run this command.");

        try {
            const gitOut = execSync("git pull").toString();
            if (gitOut.includes("Already up to date."))
                return reply(msg, {
                    content: "Already up to date"
                });

            const changedFiles = gitOut.trim().split("\n").reverse()[0].trim();

            const restartData: any = {
                channelID: msg.channelID,
                files: changedFiles,
            };

            if (install)
                execSync("pnpm i").toString();

            await reply(msg, {
                content: "Updated!! Now restarting..."
            });

            fs.writeFileSync("./data/assets/restart-data.json", JSON.stringify(restartData));

            process.exit(0);
        } catch (e) {
            console.error(e);
            reply(msg, {
                content: "Failed to update: " + codeblock(String(e), "")
            });
        }
    },
});
