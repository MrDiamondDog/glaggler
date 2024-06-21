import fs from "fs";

import { PREFIX } from "../client";
import { Command, Commands, defineCommand } from "../command";
import { reply } from "../utils";

const customCommands: Record<string, string> = {};

if (fs.existsSync("./data/customCommands.json")) {
    const data = JSON.parse(fs.readFileSync("./data/customCommands.json", "utf8"));
    for (const key in data) {
        const command = {
            name: key,
            description: `Responds with ${data[key]}`,

            async execute(msg) {
                return reply(msg, data[key]);
            }
        } as Command;

        defineCommand(command);
        customCommands[key] = data[key];
    }
}

defineCommand({
    name: "commands",
    description: "Create/delete simple commands that respond with something",
    usage: "commands <make|delete> <name> [response]",

    async execute(msg, subcommand, name, ...response) {
        if (!name) return reply(msg, "Please provide a name for the command");

        if (subcommand === "make") {
            if (!response.length) return reply(msg, "Please provide a response for the command");

            if (customCommands[name] || Commands[name]) {
                return reply(msg, "Command already exists");
            }

            let isOtherCustomCommand = false;
            for (const command of [...Object.keys(customCommands), "commands", name]) {
                if (response.join(" ").startsWith(PREFIX + command)) {
                    isOtherCustomCommand = true;
                    break;
                }
            }

            if (isOtherCustomCommand) {
                return reply(msg, "im not a dumbass");
            }

            customCommands[name] = response.join(" ");
            fs.writeFileSync("./data/customCommands.json", JSON.stringify(customCommands));

            const command = {
                name,
                description: `Responds with ${customCommands[name]}`,

                async execute(msg) {
                    return reply(msg, customCommands[name]);
                }
            } as Command;

            defineCommand(command);
            return reply(msg, `Command ${name} created`);
        } else if (subcommand === "delete") {
            if (!customCommands[name]) return reply(msg, "Command does not exist");

            delete customCommands[name];
            fs.writeFileSync("./data/customCommands.json", JSON.stringify(customCommands));

            delete Commands[name];
            return reply(msg, `Command ${name} deleted`);
        } else {
            return reply(msg, "Invalid subcommand");
        }
    }
});
