import { ComponentInteraction, MessageFlags } from "oceanic.js";
import { Page } from "puppeteer";

import { Glaggler } from "../client";
import { upload } from "../utils";

export let activePage: Page | null = null;
export let activeBrowserMessage: string | null = null;
export let activeBrowserUserId: string | null = null;
export function setActivePage(page: Page, message: string, userId: string) {
    activePage = page;
    activeBrowserMessage = message;
    activeBrowserUserId = userId;
}

export async function updateBrowser(channelID: string) {
    if (!activePage) return;
    await upload(channelID, await activePage!.screenshot(), {}, "PATCH", activeBrowserMessage!);
}

Glaggler.on("interactionCreate", async interaction => {
    if (!interaction.isComponentInteraction()) return;

    const button = interaction as ComponentInteraction;

    if (!button.data.customID.startsWith("browser")) return;
    if (button.user.id !== activeBrowserUserId)
        return await button.reply({ content: "You are not allowed to interact with this browser.", flags: MessageFlags.EPHEMERAL });

    const buttonId = button.data.customID.split("-").slice(1, -1).join("-");

    try {
        switch (buttonId) {
            case "tab-back":
                await activePage!.keyboard.down("Shift");
                await activePage!.keyboard.press("Tab");
                await activePage!.keyboard.up("Shift");
                await updateBrowser(button.channelID);
                break;
            case "tab-forward":
                await activePage!.keyboard.press("Tab");
                await updateBrowser(button.channelID);
                break;
            case "arrow-left":
                await activePage!.keyboard.press("ArrowLeft");
                await updateBrowser(button.channelID);
                break;
            case "arrow-right":
                await activePage!.keyboard.press("ArrowRight");
                await updateBrowser(button.channelID);
                break;
            case "arrow-up":
                await activePage!.keyboard.press("ArrowUp");
                await updateBrowser(button.channelID);
                break;
            case "arrow-down":
                await activePage!.keyboard.press("ArrowDown");
                await updateBrowser(button.channelID);
                break;
            case "enter":
                await activePage!.keyboard.press("Enter");
                await updateBrowser(button.channelID);
                break;
            case "update-view":
                await updateBrowser(button.channelID);
                break;
            case "close":
                await activePage!.close();
                activePage = null;
                activeBrowserMessage = null;
                activeBrowserUserId = null;
                await button.editParent({ content: "Browser closed." });
                return;
        }

        // acknowledge button press
        await button.deferUpdate();
    } catch (e: any) {
        return await button.reply({ content: "Failed to execute action: " + e.message, flags: MessageFlags.EPHEMERAL });
    }
});
