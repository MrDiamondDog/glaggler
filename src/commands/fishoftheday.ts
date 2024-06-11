import fs from "fs";

import { defineCommand } from "../command";
import { reply, seededRandom } from "../utils";

const fishes = JSON.parse(fs.readFileSync("./data/assets/fish.json", "utf8"));

defineCommand({
    name: "fishoftheday",
    description: "fish of the day",
    usage: "fishoftheday",
    aliases: ["fotd"],

    execute(msg, ...args) {
        const today = new Date();
        const seed = today.getFullYear() + today.getMonth() + today.getDate();
        const random = seededRandom(seed);
        const fish = fishes[Math.floor(random * fishes.length)];

        return reply(msg, `[${fish.name}](${fish.url})`);
    },
});
