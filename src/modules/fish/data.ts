import fs from "fs";

import { progressBar } from "../../utils/progressBar";
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
    if (!userData.collections) userData.collections = {};
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

export function xpBar(user: UserData, length: number = 8) {
    const requiredXp = requiredXpForNextLevel(user.level);

    const out = `Level ${user.level} ${progressBar(user.xp, requiredXp)} ${user.xp}/${requiredXp} XP`;

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

    fs.writeFileSync("data/fishData.json", JSON.stringify(saveData, null, 4));
}
