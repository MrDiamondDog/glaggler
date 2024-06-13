import { NullablePartialEmoji } from "oceanic.js";

import { emoji } from "../../utils";
import { Fish } from "./types";

export const fishCoins: Record<number, NullablePartialEmoji> = {
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

export function coins(amount: number, truncate?: boolean): string {
    if (truncate) return `$${amount}`;

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
