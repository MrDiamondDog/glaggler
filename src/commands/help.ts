import { PREFIX } from "../client";
import { Commands, defineCommand } from "../command";
import { reply, ZWSP } from "../utils";

defineCommand({
    name: "help",
    aliases: ["h", "?"],
    description: "List all commands",
    execute(msg) {
        return reply(msg, { content: commandList() });
    },
});

function commandList() {
    const commands = Object.entries(Commands)
        .filter(([name, cmd]) => cmd.name === name); // remove aliased commands

    const longestNameLength = commands.reduce((max, [name]) => Math.max(max, name.length), 0) + 1;

    const commandDescriptions = commands.map(([_, cmd], i) => {
        const paddedName = cmd.name.padEnd(longestNameLength, " ");
        return `\`${i === 0 ? ZWSP : ""} ${paddedName}\`   ${cmd.description}`;
    }).join("\n");

    return commandDescriptions + `\n\nUse \`${PREFIX}help <command>\` for more information on a specific command!`;
}
