import fs from "fs";

import { defineCommand } from "../command";
import { reply } from "../utils";

defineCommand({
    name: "restart",
    description: "Restart the bot",
    ownerOnly: true,

    async execute(msg) {
        const restartData: any = {
            channelID: msg.channelID,
        };

        await reply(msg, {
            content: "Restarting..."
        });

        fs.writeFileSync("./data/assets/restart-data.json", JSON.stringify(restartData));

        process.exit(0);
    },
});
