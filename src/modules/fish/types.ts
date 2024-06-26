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

export type UserData = {
    state: UserState;
    catching?: Fish;
    coins: number;
    inventorySlots: number;
    inventory: InventoryFish[];
    level: number;
    xp: number;
    collections: Record<string, number>;
}


export type UserState = "waiting" | "catching" | "idle";
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
        percentChance: 100,
        emoji: {
            name: "common_star",
            id: "1251263297483833435"
        }
    },
    uncommon: {
        multiplier: 1.25,
        requiredLevel: 2,
        percentChance: 50,
        emoji: {
            name: "uncommon_star",
            id: "1251263304404435136"
        }
    },
    rare: {
        multiplier: 1.5,
        requiredLevel: 4,
        percentChance: 25,
        emoji: {
            name: "rare_star",
            id: "1251263335949930650"
        }
    },
    epic: {
        multiplier: 1.75,
        requiredLevel: 8,
        percentChance: 15,
        emoji: {
            name: "epic_star",
            id: "1251263298679083079"
        }
    },
    legendary: {
        multiplier: 2,
        requiredLevel: 12,
        percentChance: 7,
        emoji: {
            name: "legendary_star",
            id: "1251263334414684321"
        }
    },
    mythic: {
        multiplier: 2.5,
        requiredLevel: 15,
        percentChance: 3,
        emoji: {
            name: "mythic_star",
            id: "1251263301720215644"
        }
    },
};

export function randomRarity(level: number): FishRarity {
    const rarityList = Object.keys(rarityData) as FishRarity[];
    const rarity = rarityList.reverse().find(rarity => {
        const data = rarityData[rarity];
        return level >= data.requiredLevel && Math.random() * 100 < data.percentChance;
    });
    return rarity ?? "common";
}
