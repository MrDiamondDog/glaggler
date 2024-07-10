import { PREFIX } from "../client";
import { Commands, defineCommand } from "../command";
import { reply, ZWSP } from "../utils";

defineCommand({
    name: "help",
    aliases: ["shelp", "theylp", "h", "?"],
    description: "List all commands",
    usage: "help [command]",

    execute(msg, ...args) {
        if (args.length) {
            return reply(msg, { content: commandHelp(args[0]) });
        }

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

function commandHelp(commandName: string) {
    const command = Commands[commandName];
    if (!command)
        return `Command \`${commandName}\` not found`;

    const usage = command.usage ? `\n\`${command.usage}\`` : "";
    const aliases = command.aliases ? `\nAliases: \`${command.aliases.join("`, `")}\`` : "";
    return `**${PREFIX}${command.name}**${aliases}${usage}\n${command.description}`;
}
