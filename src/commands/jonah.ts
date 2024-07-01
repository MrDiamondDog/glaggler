import { ComponentInteraction, ComponentTypes, MessageComponentSelectMenuInteractionData } from "oceanic.js";

import { Glaggler } from "../client";
import { defineCommand } from "../command";
import { reply } from "../utils";
import { row } from "../utils/components";

defineCommand({
    name: "jonah",
    description: "click that mf jonah",
    aliases: ["clickthatmfjonah"],

    execute(msg, ...args) {
        return reply(msg, {
            components: [row({
                type: ComponentTypes.USER_SELECT,
                customID: "clickmfjonah",
                placeholder: "click that mf jonah",
            })]
        });
    },
});

Glaggler.on("interactionCreate", async interaction => {
    if ((interaction as ComponentInteraction).data.customID === "clickmfjonah") {
        (interaction as ComponentInteraction).deferUpdate();
        const userId = ((interaction as ComponentInteraction).data as MessageComponentSelectMenuInteractionData).values.raw[0];
        if (userId === "722264513021476986") return (interaction as ComponentInteraction).reply({ content: "you clicked that mf jonah" });
        else return (interaction as ComponentInteraction).reply({ content: "you did NOT click that mf jonah :sob:" });
    }
});
