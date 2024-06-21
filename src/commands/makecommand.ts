import fs from "fs";

import { Command, defineCommand } from "../command";
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
    name: "makecommand",
    description: "Create a simple command that responds with something",
    usage: "makecommand <name> <response>",

    async execute(msg, name, ...response) {
        if (!name) return reply(msg, "Please provide a name for the command");
        if (!response.length) return reply(msg, "Please provide a response for the command");

        const command = {
            name,
            description: `Responds with ${response.join(" ")}`,

            async execute(msg) {
                return reply(msg, response.join(" "));
            }
        };

        defineCommand(command);
        customCommands[name] = response.join(" ");
        fs.writeFileSync("./data/customCommands.json", JSON.stringify(customCommands));
        return reply(msg, `Command ${name} created`);
    }
});
