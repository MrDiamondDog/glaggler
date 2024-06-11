import { defineCommand } from "../command";
import { reply } from "../utils";

defineCommand({
    name: "echo",
    description: "echo.. echo.. echo..",
    usage: "echo [text]",

    execute(msg, ...args) {
        return reply(msg, args.join(" ") || "https://tenor.com/view/cat-spin-neko-atsume-me-when-i-get-you-rotate-gif-11810485183563132952");
    },
});
