import { ComponentInteraction } from "oceanic.js";

import { edit, emoji, sleep } from "../../utils";
import { button, row } from "../../utils/components";
import { catchFishButtonRows, sellFishButton, startFishButton } from "./buttons";
import { fishData } from "./data";
import { coins, getFish, randomFish } from "./fishes";
import { rarityData } from "./types";

export function sellFishPage(interaction: ComponentInteraction) {
    const { message, user: { id: userId } } = interaction;
    const { inventory } = fishData[userId];

    interaction.deferUpdate();

    if (inventory.length === 0)
        return edit(message.id, message.channelID, {
            content: "you have no fish to sell :(\ngo catch some fish :3",
            components: [row(startFishButton(userId))]
        });

    const allFish = inventory.map(f => {
        const fish = getFish(f.name)!;
        return `${fish.emoji || emoji(fish.customEmoji!)} ${emoji(rarityData[f.rarity].emoji)} - ${coins(fish.baseValue)}`;
    }).join("\n");

    const totalValue = inventory.reduce((acc, fish) => acc + fish.value, 0);

    const out = `${allFish}\n------------------\nTotal: ${coins(totalValue)}`;

    return edit(message.id, message.channelID, {
        content: out,
        components: [row(button("sellall-" + userId, "Sell All"))]
    });
}

export async function fishingPage(interaction: ComponentInteraction) {
    const { message, user: { id: userId } } = interaction;
    const playerData = fishData[userId];

    interaction.deferUpdate();

    if (playerData.state !== "idle") return;

    if (playerData.inventory.length >= playerData.inventorySlots) {
        return await edit(message.id, message.channelID, {
            content: "you have no inventory slots :(\ngo sell some fish :3",
            components: [row(sellFishButton(userId))]
        });
    }

    const rows = 3;
    const cols = 3;

    const fishMsg = await edit(message.id, message.channelID, {
        content: `waiting for fish :3\n${playerData.inventory.length}/${playerData.inventorySlots} inventory slots`,
        components: catchFishButtonRows(userId, rows, cols)
    });

    const fishToCatch = randomFish();
    const fishIndex = Math.floor(Math.random() * 9);

    playerData.catching = fishToCatch;

    playerData.state = "waiting";
    await sleep(Math.floor(Math.random() * 10000));

    playerData.state = "catching";
    await edit(fishMsg.id, fishMsg.channelID, {
        components: catchFishButtonRows(userId, rows, cols, fishToCatch, fishIndex)
    });

    await sleep(1500);

    if (playerData.state !== "catching") return;

    playerData.state = "idle";
    await edit(fishMsg.id, fishMsg.channelID, {
        content: "you missed the fish :(",
        components: [row(startFishButton(userId, "Fish Again"))]
    });

    playerData.catching = undefined;
}
