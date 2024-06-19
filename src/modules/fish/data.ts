import fs from "fs";

import { Fish, InventoryFish, randomRarity, rarityData,UserData } from "./types";

export const fishData: Record<string, UserData> = {};
export const playerSaveDataKeys: Array<keyof UserData> = ["inventory", "coins", "inventorySlots", "level", "xp", "collections"];

export function requiredXpForNextLevel(currentLevel: number): number {
    return 5 * Math.pow(currentLevel, 2) + 50 * currentLevel + 100;
}

export function addFish(user: string, fish: Fish): { fish: InventoryFish; xp: number; } {
    const userData = fishData[user];

    const inventoryFish: InventoryFish = { name: fish.name, value: fish.baseValue, rarity: randomRarity(userData.level) };
    inventoryFish.value = Math.ceil(inventoryFish.value * rarityData[inventoryFish.rarity].multiplier);

    userData.inventory.push(inventoryFish);
    userData.collections[fish.name] = (userData.collections[fish.name] || 0) + 1;

    const xp = getXpForFish(inventoryFish);
    addXp(user, xp);

    saveFishData();

    return { fish: inventoryFish, xp };
}

export function addXp(user: string, xp: number) {
    const userData = fishData[user];

    userData.xp += xp;

    if (requiredXpForNextLevel(userData.level) < userData.xp) {
        userData.xp -= requiredXpForNextLevel(userData.level);
        userData.level++;
    }
}

export function getXpForFish(fish: InventoryFish): number {
    const { multiplier } = rarityData[fish.rarity];

    let xp = Math.ceil(fish.value * multiplier);
    xp = Math.min(xp, 30);

    const randomFactor = 1 + (Math.random() - 0.5) / 5; // 0.9 <= x <= 1.1
    xp = Math.ceil(xp * randomFactor);

    return Math.min(xp, 30);
}

const xpBarEmojis = {
    left: {
        full: "<:bar_left_full:1251265391011823777>",
        empty: "<:bar_left_empty:1251265389946736731>"
    },
    middle: {
        full: "<:bar_middle_full:1251266233483923609>",
        empty: "<:bar_middle_empty:1251265393016705096>"
    },
    right: {
        full: "<:bar_right_full:1251265397051756584>",
        empty: "<:bar_right_empty:1251265395923619970>"
    }
};

export function xpBar(user: UserData, length: number = 8) {
    let bar = "";
    const requiredXp = requiredXpForNextLevel(user.level);
    const percentage = Math.floor(user.xp / requiredXp * length);

    for (let i = 0; i < length; i++) {
        if (percentage > i) bar += "1";
        else bar += "0";
    }

    let emojiBar = "";
    for (let i = 0; i < length; i++) {
        if (i === 0) {
            if (bar[i] === "1") emojiBar += xpBarEmojis.left.full;
            else emojiBar += xpBarEmojis.left.empty;
            continue;
        }

        if (i !== 0 && i !== length - 1) {
            if (bar[i] === "1") emojiBar += xpBarEmojis.middle.full;
            else emojiBar += xpBarEmojis.middle.empty;
            continue;
        }

        if (i === length - 1) {
            if (bar[i] === "1") emojiBar += xpBarEmojis.right.full;
            else emojiBar += xpBarEmojis.right.empty;
            continue;
        }
    }

    const out = `Level ${user.level} ${emojiBar} ${user.xp}/${requiredXp} XP`;

    return out;
}

export function sellAll(user: string): number {
    const total = fishData[user].inventory.reduce((acc, fish) => acc + fish.value, 0);

    fishData[user].coins += total;
    fishData[user].inventory = [];

    saveFishData();

    return total;
}

export function saveFishData() {
    const saveData: Record<string, any> = {};

    for (const key in fishData) {
        for (const saveKey of playerSaveDataKeys) {
            if (!saveData[key]) saveData[key] = {};
            saveData[key][saveKey] = fishData[key][saveKey];
        }
    }

    fs.writeFileSync("fishData.json", JSON.stringify(saveData, null, 4));
}
