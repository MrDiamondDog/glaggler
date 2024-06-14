import { NullablePartialEmoji } from "oceanic.js";

export type Fish = {
    name: string;
    emoji?: string;
    customEmoji?: NullablePartialEmoji;
    baseValue: number;
}

export type InventoryFish = {
    name: string;
    value: number;
    rarity: FishRarity;
}

export type PlayerData = {
    state: PlayerState;
    catching?: Fish;
    coins: number;
    inventorySlots: number;
    inventory: InventoryFish[];
    level: number;
    xp: number;
}


export type PlayerState = "waiting" | "catching" | "idle";
export type FishRarity = "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic";

export type FishRarityData = {
    multiplier: number;
    requiredLevel: number;
    percentChance: number;
    emoji: NullablePartialEmoji;
}

export const rarityData: Record<FishRarity, FishRarityData> = {
    common: {
        multiplier: 1.0,
        requiredLevel: 0,
        percentChance: 38,
        emoji: {
            name: "common_star",
            id: "1251245212517400667"
        }
    },
    uncommon: {
        multiplier: 1.1,
        requiredLevel: 2,
        percentChance: 30,
        emoji: {
            name: "uncommon_star",
            id: "1251245218494283927"
        }
    },
    rare: {
        multiplier: 1.25,
        requiredLevel: 4,
        percentChance: 15,
        emoji: {
            name: "rare_star",
            id: "1251245217378730035"
        }
    },
    epic: {
        multiplier: 1.5,
        requiredLevel: 8,
        percentChance: 10,
        emoji: {
            name: "epic_star",
            id: "1251245213083762741"
        }
    },
    legendary: {
        multiplier: 1.75,
        requiredLevel: 12,
        percentChance: 5,
        emoji: {
            name: "legendary_star",
            id: "1251245214471815169"
        }
    },
    mythic: {
        multiplier: 2.0,
        requiredLevel: 15,
        percentChance: 2,
        emoji: {
            name: "mythic_star",
            id: "1251245216133021748"
        }
    },
};

export function randomRarity(level: number): FishRarity {
    let max = 0;

    for (const rarity in rarityData) {
        const { requiredLevel } = rarityData[rarity];

        if (requiredLevel <= level)
            max += rarityData[rarity].requiredLevel;
    }

    const random = Math.floor(Math.random() * max);

    for (const rarity in rarityData) {
        const { percentChance } = rarityData[rarity];

        if (random > percentChance)
            return rarity as FishRarity;
    }

    return "common";
}
