
import { defineCommand } from "../command";
import { sellFishButton, startFishButton } from "../modules/fish/buttons";
import { fishStore } from "../modules/fish/data";
import { reply } from "../utils";
import { row } from "../utils/components";

defineCommand({
    name: "fish",
    description: "thank you fish :fish:",
    usage: "fish",

    async execute(msg, ...args) {
        const userId = msg.author.id;
        const userData = fishStore.data[userId];

        if (!userData)
            fishStore.data[userId] = { state: "idle", inventory: [], coins: 0, inventorySlots: 10, level: 0, xp: 0, collections: {} };

        reply(msg, {
            content: "fishing :3",
            components: [row(startFishButton(userId), sellFishButton(userId))]
        });
    },
});
