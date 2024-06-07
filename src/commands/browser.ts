import { ButtonStyles, ComponentTypes } from "oceanic.js";
import puppeteer from "puppeteer";

import { PREFIX } from "../client";
import { defineCommand } from "../command";
import { activePage, setActivePage } from "../modules/browser";
import { edit, reply, upload } from "../utils";


defineCommand({
    name: "browser",
    description: "Open a browser",
    usage: "browser [url]",

    async execute(msg, ...args) {
        if (activePage)
            return reply(msg, "A browser is already open. Please close it first.");

        const browser = await puppeteer.launch({
            headless: true
        });
        const page = await browser!.newPage();

        await page.setViewport({ width: 1440, height: 1080 });
        await page.goto(args[0] || "https://google.com");

        const screenshotMsg = await upload(msg.channelID, await page.screenshot());

        edit(screenshotMsg.id, msg.channelID, {
            components: [
                {
                    type: ComponentTypes.ACTION_ROW,
                    components: [
                        {
                            type: ComponentTypes.BUTTON,
                            label: "<",
                            style: ButtonStyles.PRIMARY,
                            customID: "browser-tab-back-" + msg.id
                        },
                        {
                            type: ComponentTypes.BUTTON,
                            label: "Select",
                            style: ButtonStyles.SECONDARY,
                            disabled: true,
                            customID: "."
                        },
                        {
                            type: ComponentTypes.BUTTON,
                            label: ">",
                            style: ButtonStyles.PRIMARY,
                            customID: "browser-tab-forward-" + msg.id
                        }
                    ]
                },
                {
                    type: ComponentTypes.ACTION_ROW,
                    components: [
                        {
                            type: ComponentTypes.BUTTON,
                            label: "Enter",
                            style: ButtonStyles.PRIMARY,
                            customID: "browser-enter-" + msg.id
                        },
                        {
                            type: ComponentTypes.BUTTON,
                            disabled: true,
                            style: ButtonStyles.SECONDARY,
                            label: `Use ${PREFIX}type [text] to type in the browser`,
                            customID: ".."
                        }
                    ]
                },
                {
                    type: ComponentTypes.ACTION_ROW,
                    components: [
                        {
                            type: ComponentTypes.BUTTON,
                            label: "←",
                            style: ButtonStyles.SECONDARY,
                            customID: "browser-arrow-left-" + msg.id
                        },
                        {
                            type: ComponentTypes.BUTTON,
                            label: "↑",
                            style: ButtonStyles.SECONDARY,
                            customID: "browser-arrow-up-" + msg.id
                        },
                        {
                            type: ComponentTypes.BUTTON,
                            label: "→",
                            style: ButtonStyles.SECONDARY,
                            customID: "browser-arrow-right-" + msg.id
                        },
                        {
                            type: ComponentTypes.BUTTON,
                            label: "↓",
                            style: ButtonStyles.SECONDARY,
                            customID: "browser-arrow-down-" + msg.id
                        }
                    ]
                },
                {
                    type: ComponentTypes.ACTION_ROW,
                    components: [
                        {
                            type: ComponentTypes.BUTTON,
                            label: "Update View",
                            style: ButtonStyles.PRIMARY,
                            customID: "browser-update-view-" + msg.id
                        },
                        {
                            type: ComponentTypes.BUTTON,
                            label: "Close",
                            style: ButtonStyles.DANGER,
                            customID: "browser-close-" + msg.id
                        }
                    ]
                }
            ]
        });

        setActivePage(page, screenshotMsg.id, msg.author.id);
    },
});
