import fs from "fs";

import { Fish, PlayerData } from "./types";

export const fishData: Record<string, PlayerData> = {};
export const playerSaveDataKeys: Array<keyof PlayerData> = ["inventory", "coins", "inventorySlots"];

export function addFish(user: string, fish: Fish) {
    fishData[user].inventory.push(fish);
    saveFishData();
}

export function sellAll(user: string): number {
    const total = fishData[user].inventory.reduce((acc, fish) => acc + fish.baseValue, 0);

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
