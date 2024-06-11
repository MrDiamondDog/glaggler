import fs from "fs";
import { ButtonStyles, ComponentInteraction, ComponentTypes, Message, MessageActionRow, MessageComponent, MessageFlags, NullablePartialEmoji } from "oceanic.js";

import { Glaggler } from "../client";
import { edit, emoji, sleep, ZWSP } from "../utils";

export type Fish = {
    name: string;
    emoji?: string;
    customEmoji?: NullablePartialEmoji
    baseValue: number;
    rarity?: FishRarity;
}

export type FishData = {
    state: FishState;
    catching?: Fish;
    coins: number;
    inventorySlots: number;
    inventory: Fish[];
}

export type FishState = "waiting" | "catching" | "idle";
export type FishRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

const fishCoins: Record<number, NullablePartialEmoji> = {
    1: {
        name: "1_fish_bucks",
        id: "1249546391663935641"
    },
    5: {
        name: "5_fish_bucks",
        id: "1249546393903829113"
    },
    10: {
        name: "10_fish_bucks",
        id: "1249546396848357416"
    },
    15: {
        name: "15_fish_bucks",
        id: "1249546398400122940"
    },
    25: {
        name: "25_fish_bucks",
        id: "1249546399734038568"
    },
    50: {
        name: "50_fish_bucks",
        id: "1249546401709559900"
    },
};

export function coins(amount: number): string {
    const originalAmount = amount;
    let out = "";
    for (const denom of Object.keys(fishCoins).reverse().map(str => parseInt(str))) {
        const denomAmount = Math.floor(amount / denom);
        amount -= denomAmount * denom;
        out += emoji(fishCoins[denom])?.repeat(denomAmount);
    }
    out += ` ($${originalAmount})`;
    return out;
}

const saveKeys: Array<keyof FishData> = ["inventory", "coins"];

export const fishData: Record<string, FishData> = {};

export const fishes: Fish[] = [
    {
        name: "jonah",
        baseValue: 30,
        customEmoji: {
            name: "JONAHHH",
            id: "1249575999021256714"
        }
    },
    {
        name: "anglerfish",
        baseValue: 25,
        customEmoji: {
            name: "anglerfish",
            id: "1249575988585824347"
        }
    },
    {
        name: "crab",
        baseValue: 15,
        customEmoji: {
            name: "crab",
            id: "1249575990418608271"
        }
    },
    {
        name: "dolphin",
        baseValue: 20,
        customEmoji: {
            name: "dolphin",
            id: "1249575995200241674"
        }
    },
    {
        name: "eel",
        baseValue: 20,
        customEmoji: {
            name: "eel",
            id: "1249575996936421396"
        }
    },
    {
        name: "lobster",
        baseValue: 15,
        customEmoji: {
            name: "lobster",
            id: "1249576001386713131"
        }
    },
    {
        name: "octopus",
        baseValue: 20,
        customEmoji: {
            name: "octopus",
            id: "1249576002808578078"
        }
    },
    {
        name: "salmon",
        baseValue: 15,
        customEmoji: {
            name: "salmon",
            id: "1249576006860410932"
        }
    },
    {
        name: "seahorse",
        baseValue: 10,
        customEmoji: {
            name: "seahorse",
            id: "1249576008881930320"
        }
    },
    {
        name: "shrimp",
        baseValue: 10,
        customEmoji: {
            name: "shrimp",
            id: "1249576010798862366"
        }
    },
    {
        name: "slippery dick",
        baseValue: 25,
        customEmoji: {
            name: "slippery_dick",
            id: "1249575992780001411"
        }
    },
    {
        name: "squid",
        baseValue: 20,
        customEmoji: {
            name: "squid",
            id: "1249576058769117314"
        }
    },
    {
        name: "stingray",
        baseValue: 20,
        customEmoji: {
            name: "stingray",
            id: "1249576005367103568"
        }
    },
    {
        name: "sunfish",
        baseValue: 10,
        customEmoji: {
            name: "sunfish",
            id: "1249576014288388226"
        }
    },
    {
        name: "talapia",
        baseValue: 15,
        customEmoji: {
            name: "talapia",
            id: "1249576019522748487"
        }
    },
    {
        name: "whale",
        baseValue: 25,
        customEmoji: {
            name: "whale",
            id: "1249576022731391087"
        }
    }
];

export function randomFish() {
    return fishes[Math.floor(Math.random() * fishes.length)];
}

export function getFish(name: string) {
    return fishes.find(f => f.name === name);
}

export function addFish(user: string, fish: Fish) {
    fishData[user].inventory.push(fish);
    saveFishData();
}

export function saveFishData() {
    const saveData: Record<string, any> = {};

    for (const key in fishData) {
        for (const saveKey of saveKeys) {
            if (!saveData[key]) saveData[key] = {};
            saveData[key][saveKey] = fishData[key][saveKey];
        }
    }

    fs.writeFileSync("fishData.json", JSON.stringify(saveData, null, 4));
}

if (fs.existsSync("fishData.json")) {
    Object.assign(fishData, JSON.parse(fs.readFileSync("fishData.json", "utf8")));
    Object.keys(fishData).forEach(id => {
        if (!fishData[id].state) fishData[id].state = "idle";
    });
} else {
    Object.assign(fishData, {});
    fs.writeFileSync("fishData.json", "{}");
}

function fishComponent(user: string, index: number, fish?: Fish): MessageComponent {
    return {
        type: ComponentTypes.BUTTON,
        style: ButtonStyles.SECONDARY,
        customID: `fish-${index}${fish ? "!" : ""}-${user}`,
        label: `${ZWSP}`,
        emoji: fish ? fish.customEmoji || { name: fish.emoji } : undefined,
    };
}

function fishRows(user: string, rows: number, cols: number, fish?: Fish, fishIndex?: number): MessageActionRow[] {
    const components: MessageActionRow[] = [];

    for (let i = 0; i < rows; i++) {
        const row: MessageComponent[] = [];

        for (let j = 0; j < cols; j++) {
            const index = i * cols + j;
            row.push(fishComponent(user, index, index === fishIndex ? fish : undefined));
        }

        components.push({
            type: ComponentTypes.ACTION_ROW,
            components: row
        });
    }

    return components;
}

function fishAgainComponent(user: string, text: string = "Fish again"): MessageActionRow {
    return {
        type: ComponentTypes.ACTION_ROW,
        components: [{
            type: ComponentTypes.BUTTON,
            style: ButtonStyles.SECONDARY,
            customID: `fish-again-${user}`,
            label: text
        }]
    };
}

function sellFishComponent(user: string): MessageActionRow {
    return {
        type: ComponentTypes.ACTION_ROW,
        components: [{
            type: ComponentTypes.BUTTON,
            style: ButtonStyles.SECONDARY,
            customID: `sell-fish-${user}`,
            label: "Sell fish"
        }]
    };
}

export function sellFish(msg: Message, user: string) {
    const { inventory } = fishData[user];

    if (inventory.length === 0)
        return edit(msg.id, msg.channelID, {
            content: "you have no fish to sell :(\ngo catch some fish :3",
            components: [fishAgainComponent(user)]
        });

    const allFish = inventory.map(fish => `${fish.emoji || emoji(fish.customEmoji!)} - ${coins(fish.baseValue)}`).join("\n");
    const totalValue = inventory.reduce((acc, fish) => acc + fish.baseValue, 0);

    return edit(msg.id, msg.channelID, {
        content: `${allFish}\n------------------\nTotal: ${coins(totalValue)}`,
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

export async function startFish(msg: Message, user: string) {
    if (fishData[user].state !== "idle") return;

    if (fishData[user].inventorySlots <= fishData[user].inventory.length) {
        return await edit(msg.id, msg.channelID, {
            content: "you have no inventory slots :(\ngo sell some fish :3",
            components: [sellFishComponent(user)]
        });
    }

    const rows = 3;
    const cols = 3;

    const fishMsg = await edit(msg.id, msg.channelID, {
        components: fishRows(user, rows, cols)
    });

    const fishToCatch = randomFish();
    const fishIndex = Math.floor(Math.random() * 9);

    fishData[user].catching = fishToCatch;

    fishData[user].state = "waiting";
    await sleep(Math.floor(Math.random() * 10000));

    fishData[user].state = "catching";
    await edit(fishMsg.id, fishMsg.channelID, {
        components: fishRows(user, rows, cols, fishToCatch, fishIndex)
    });

    await sleep(1500);

    if (fishData[user].state !== "catching") return;

    fishData[user].state = "idle";
    await edit(fishMsg.id, fishMsg.channelID, {
        content: "you missed the fish :(",
        components: [fishAgainComponent(user)]
    });

    fishData[user].catching = undefined;
}

Glaggler.on("interactionCreate", async interaction => {
    if (!interaction.isComponentInteraction()) return;

    const button = interaction as ComponentInteraction;

    if (button.data.customID.startsWith("fish-again")) {
        if (button.data.customID.split("-")[2] !== button.user.id)
            return button.reply({
                content: "this is not your fucking fish",
                flags: MessageFlags.EPHEMERAL
            });

        button.deferUpdate();
        startFish(button.message, button.user.id);
        return;
    } else if (button.data.customID.startsWith("sell-fish")) {
        if (button.data.customID.split("-")[2] !== button.user.id)
            return button.reply({
                content: "this is not your fucking fish",
                flags: MessageFlags.EPHEMERAL
            });

        button.deferUpdate();
        sellFish(button.message, button.user.id);
        return;
    } else if (button.data.customID.startsWith("sell-all")) {
        if (button.data.customID.split("-")[2] !== button.user.id)
            return button.reply({
                content: "this is not your fucking fish",
                flags: MessageFlags.EPHEMERAL
            });
        const user = button.data.customID.split("-")[2];
        const total = fishData[user].inventory.reduce((acc, fish) => acc + fish.baseValue, 0);
        fishData[user].coins += total;
        fishData[user].inventory = [];
        saveFishData();
        return button.editParent({
            content: `sold all fish for ${coins(total)}\nyou now have ${coins(fishData[user].coins)}`,
            components: [fishAgainComponent(user, "Go fishing")]
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
            components: [fishAgainComponent(userId)]
        });
    }

    const { catching } = fishData[userId];

    if (!catching) return;

    if (index.endsWith("!")) {
        addFish(userId, catching);
        fishData[userId].state = "idle";
        return button.editParent({
            content: `you got a **${catching.name}** ${catching.emoji || emoji(catching.customEmoji!)}!`,
            components: [fishAgainComponent(userId), sellFishComponent(userId)]
        });
    } else {
        button.deferUpdate();
    }
});
