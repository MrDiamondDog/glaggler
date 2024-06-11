
import { TextChannel } from "oceanic.js";

import { drawChannelRedirectImage } from "../channelRedirect";
import { defineCommand } from "../command";
import { fishData, fishes, sellFish, startFish } from "../modules/fish";
import { emoji, reply } from "../utils";
import { coins } from "./../modules/fish";

defineCommand({
    name: "fish",
    description: "thank you fish :fish:",
    usage: "fish [collections|leaderboard|sell]",

    async execute(msg, ...args) {
        if (!(msg.channel as TextChannel).name.startsWith("fish-"))
            return msg.channel!.createMessage({
                files: [
                    {
                        name: "thisisNOTthefishingchannelFUCKYOU.png",
                        contents: await drawChannelRedirectImage({
                            currentCategory: (msg.channel as TextChannel).parent?.name || "",
                            currentChannel: (msg.channel as TextChannel).name,
                            currentCaption: "you are here",
                            destCategory: "fishing",
                            destChannel: "fish-1",
                            destCaption: "you want to be here"
                        })
                    }
                ]
            });

        if (!fishData[msg.author.id])
            fishData[msg.author.id] = { state: "idle", inventory: [], coins: 0, inventorySlots: 10 };

        if (args?.[0] === "collections" || args?.[0] === "collection") {
            let user: string = msg.author.id;
            if (args?.[1]) {
                const mention = args[1].match(/^<@!?(\d+)>$/);
                if (mention) user = mention[1];
            }

            const inventory = fishData[user]?.inventory;
            if (!inventory)
                return reply(msg, "no fish :(");

            const inventoryStr = fishes.map(fish => {
                const count = inventory.filter(v => v.name === fish.name).length;
                return `${fish.emoji || emoji(fish.customEmoji!)}: ${count}`;
            }).join("\n");

            return reply(msg, inventoryStr);
        }

        if (args?.[0] === "leaderboard") {
            const leaderboard = Object.entries(fishData)
                .sort((a, b) => a[1].coins - b[1].coins)
                .map((v, i) => `${i + 1}. <@${v[0]}>: ${coins(v[1].coins)}`)
                .join("\n");

            return reply(msg, leaderboard);
        }

        if (args?.[0] === "sell") {
            const message = await reply(msg, "loading...");
            return sellFish(message, msg.author.id);
        }

        const fishMsg = await reply(msg, "waiting for fish :3");
        startFish(fishMsg, msg.author.id);
    },
});