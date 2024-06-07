import { defineCommand } from "../command";
import { activePage, updateBrowser } from "../modules/browser";
import { reply } from "../utils";

defineCommand({
    name: "type",
    description: "Type something into the browser (;browser)",
    usage: "type [text]",

    async execute(msg, ...args) {
        if (!activePage)
            return reply(msg, "No browser is open. Please open one first.");

        await activePage.keyboard.type(args.join(" "));

        await updateBrowser(msg.channelID);
    }
});
