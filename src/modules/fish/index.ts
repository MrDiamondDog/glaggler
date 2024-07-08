import fs from "fs";
import { ComponentInteraction, MessageFlags } from "oceanic.js";

import { Glaggler } from "../../client";
import { emoji, stripIndent } from "../../utils";
import { row } from "../../utils/components";
import { sellFishButton,startFishButton } from "./buttons";
import { addFish, fishStore, sellAll, xpBar } from "./data";
import { coins } from "./fishes";
import { fishingPage, sellFishPage } from "./pages";
import { rarityData } from "./types";


if (fs.existsSync("./data/fish.json")) {
    fishStore.data = JSON.parse(fs.readFileSync("./data/fish.json", "utf8"));
    Object.keys(fishStore.data).forEach(id => {
        if (!fishStore.data[id].state) fishStore.data[id].state = "idle";
    });
} else {
    fishStore.data = {};
    fs.writeFileSync("./data/fish.json", "{}");
}


function notYourFish(interaction: ComponentInteraction) {
    return interaction.reply({
        content: "this is not your fucking fish",
        flags: MessageFlags.EPHEMERAL
    });
}


const buttonActions: Record<string, (interaction: ComponentInteraction) => void> = {
    "startfish": fishingPage,
    "sellfish": sellFishPage,
    "sellall": interaction => {
        const total = sellAll(interaction.user.id);
        interaction.editParent({
            content: `sold all fish for ${coins(total)}\nyou now have ${coins(fishStore.data[interaction.user.id].coins)}`,
            components: [row(startFishButton(interaction.user.id, "Go Fishing"))]
        });
    }
};

function executeButtonActions(interaction: ComponentInteraction) {
    const buttonId = interaction.data.customID;
    const [_, action, userId] = buttonId.split("-");
    const executor = interaction.user.id;

    if (userId !== executor)
        return notYourFish(interaction);

    for (const key in buttonActions) {
        if (action === key) {
            buttonActions[key](interaction);
            break;
        }
    }
}

Glaggler.on("interactionCreate", async int => {
    if (!int.isComponentInteraction()) return;

    const interaction = int as ComponentInteraction;

    console.log(interaction.data.customID);

    if (!interaction.data.customID.startsWith("fish")) return;

    if (!interaction.data.customID.startsWith("fish_")) return executeButtonActions(interaction);

    const userId = interaction.user.id;
    const index = interaction.data.customID.split("-")[0].split("_")[1];
    const userData = fishStore.data[userId];

    const { catching } = userData;

    if (!catching) return;

    console.log(index);

    if (index.endsWith("!")) {
        const addedFishData = addFish(userId, catching);
        userData.state = "idle";
        return interaction.editParent({
            content: stripIndent`
            you caught a ${catching.emoji || emoji(catching.customEmoji!)} **${catching.name}** ${emoji(rarityData[addedFishData.fish.rarity].emoji)}!
            +${addedFishData.xp} XP
            ${xpBar(userData)}`,
            components: [row(startFishButton(userId, "Fish Again")), row(sellFishButton(userId))]
        });
    } else {
        interaction.deferUpdate();
    }
});
