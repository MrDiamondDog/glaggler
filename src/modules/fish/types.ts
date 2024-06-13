import { NullablePartialEmoji } from "oceanic.js";

export type Fish = {
    name: string;
    emoji?: string;
    customEmoji?: NullablePartialEmoji;
    baseValue: number;
    rarity?: FishRarity;
}

export type PlayerData = {
    state: PlayerState;
    catching?: Fish;
    coins: number;
    inventorySlots: number;
    inventory: Fish[];
}


export type PlayerState = "waiting" | "catching" | "idle";
export type FishRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";
