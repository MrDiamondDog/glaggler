import fs from "fs";
import { ButtonStyles, ComponentInteraction, ComponentTypes, Message, MessageFlags } from "oceanic.js";

import { Glaggler } from "../../client";
import { edit, emoji, sleep } from "../../utils";
import { catchFishButtonRows, fishAgainButton, sellFishButton } from "./buttons";
import { addFish, fishData, saveFishData } from "./data";
import { coins, randomFish } from "./fishes";


if (fs.existsSync("fishData.json")) {
    Object.assign(fishData, JSON.parse(fs.readFileSync("fishData.json", "utf8")));
    Object.keys(fishData).forEach(id => {
        if (!fishData[id].state) fishData[id].state = "idle";
    });
} else {
    Object.assign(fishData, {});
    fs.writeFileSync("fishData.json", "{}");
}

function notYourFish(button: ComponentInteraction) {
    return button.reply({
        content: "this is not your fucking fish",
        flags: MessageFlags.EPHEMERAL
    });
}

export function sellFishPage(msg: Message, user: string) {
    const { inventory } = fishData[user];

    if (inventory.length === 0)
        return edit(msg.id, msg.channelID, {
            content: "you have no fish to sell :(\ngo catch some fish :3",
            components: [fishAgainButton(user)]
        });

    const allFish = inventory.map(fish => `${fish.emoji || emoji(fish.customEmoji!)} - ${coins(fish.baseValue)}`).join("\n");
    const totalValue = inventory.reduce((acc, fish) => acc + fish.baseValue, 0);

    let out = `${allFish}\n------------------\nTotal: ${coins(totalValue)}`;

    if (out.length > 1900) out = `${allFish}\n------------------\nTotal: ${coins(totalValue)}`;

    return edit(msg.id, msg.channelID, {
        content: out,
        components: [{
            type: ComponentTypes.ACTION_ROW,
            components: [{
                type: ComponentTypes.BUTTON,
                style: ButtonStyles.SECONDARY,
                customID: `sell-all-${user}`,
                label: "Sell All"
            }]
        }]
    });
}

export async function fishingPage(msg: Message, user: string) {
    if (fishData[user].state !== "idle") return;

    if (fishData[user].inventory.length >= fishData[user].inventorySlots) {
        return await edit(msg.id, msg.channelID, {
            content: "you have no inventory slots :(\ngo sell some fish :3",
            components: [sellFishButton(user)]
        });
    }

    const rows = 3;
    const cols = 3;

    const fishMsg = await edit(msg.id, msg.channelID, {
        content: `waiting for fish :3\n${fishData[user].inventory.length}/${fishData[user].inventorySlots} inventory slots\n\n`,
        components: catchFishButtonRows(user, rows, cols)
    });

    const fishToCatch = randomFish();
    const fishIndex = Math.floor(Math.random() * 9);

    fishData[user].catching = fishToCatch;

    fishData[user].state = "waiting";
    await sleep(Math.floor(Math.random() * 10000));

    fishData[user].state = "catching";
    await edit(fishMsg.id, fishMsg.channelID, {
        components: catchFishButtonRows(user, rows, cols, fishToCatch, fishIndex)
    });

    await sleep(1500);

    if (fishData[user].state !== "catching") return;

    fishData[user].state = "idle";
    await edit(fishMsg.id, fishMsg.channelID, {
        content: "you missed the fish :(",
        components: [fishAgainButton(user)]
    });

    fishData[user].catching = undefined;
}

Glaggler.on("interactionCreate", async interaction => {
    if (!interaction.isComponentInteraction()) return;

    const button = interaction as ComponentInteraction;

    if (button.data.customID.startsWith("fish-again")) {
        if (button.data.customID.split("-")[2] !== button.user.id)
            return notYourFish(button);

        button.deferUpdate();
        fishingPage(button.message, button.user.id);
        return;
    } else if (button.data.customID.startsWith("sell-fish")) {
        if (button.data.customID.split("-")[2] !== button.user.id)
            return notYourFish(button);

        button.deferUpdate();
        sellFishPage(button.message, button.user.id);
        return;
    } else if (button.data.customID.startsWith("sell-all")) {
        if (button.data.customID.split("-")[2] !== button.user.id)
            return notYourFish(button);
        const user = button.data.customID.split("-")[2];
        const total = fishData[user].inventory.reduce((acc, fish) => acc + fish.baseValue, 0);
        fishData[user].coins += total;
        fishData[user].inventory = [];
        saveFishData();
        let out = `sold all fish for ${coins(total)}\nyou now have ${coins(fishData[user].coins)}`;
        if (out.length > 1900) out = `sold all fish for ${coins(total)}\nyou now have ${coins(fishData[user].coins)}`;
        return button.editParent({
            content: out,
            components: [fishAgainButton(user, "Go fishing")]
        });
    }
    if (!button.data.customID.startsWith("fish")) return;

    const [_, index, userId] = button.data.customID.split("-");

    if (userId !== button.user.id)
        return button.reply({
            content: "this is not your fucking fish",
            flags: MessageFlags.EPHEMERAL
        });

    if (fishData[userId].state !== "catching") {
        fishData[userId].state = "idle";
        return button.editParent({
            content: "you missed the fish :(",
            components: [fishAgainButton(userId)]
        });
    }

    const { catching } = fishData[userId];

    if (!catching) return;

    if (index.endsWith("!")) {
        addFish(userId, catching);
        fishData[userId].state = "idle";
        return button.editParent({
            content: `you got a **${catching.name}** ${catching.emoji || emoji(catching.customEmoji!)}!`,
            components: [fishAgainButton(userId), sellFishButton(userId)]
        });
    } else {
        button.deferUpdate();
    }
});
