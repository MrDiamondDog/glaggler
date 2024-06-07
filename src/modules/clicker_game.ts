import { ComponentInteraction } from "oceanic.js";

import { Glaggler } from "../client";

type ClickData = {
    userId: string;
    clicks: number;
    upgrades: string[];
}

export const clickData: Record<string, ClickData> = {};

Glaggler.on("interactionCreate", async interaction => {
    if (!interaction.isComponentInteraction()) return;

    const button = interaction as ComponentInteraction;

    if (!button.data.customID.startsWith("click")) return;

    const id = button.data.customID.split("-")[1];

    if (id !== button.user.id)
        return button.reply({
            content: `<@${button.user.id}> <-- laugh at this user`,
        });

    if (!clickData[button.user.id])
        clickData[button.user.id] = { userId: button.user.id, clicks: 0, upgrades: [] };

    clickData[button.user.id].clicks += 1;

    // edit original message
    return button.editParent({
        content: clickData[button.user.id]?.clicks.toString() || "0",
        components: button.message.components
    });
});
