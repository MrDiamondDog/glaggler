import { defineCommand } from "../command";
import { reply } from "../utils";
import { personas, setPersona } from "./gpt";

defineCommand({
    name: "personality",
    description: "change the personality of the ;gpt command",
    aliases: ["persona"],
    usage: "personality <personality>",
    async execute(msg, ...args) {
        if (!args.length)
            return reply(msg, "You need to provide a personality to switch to\nAvailable personalities: " + Object.keys(personas).map(p => `\`${p}\``).join(", "));

        const personality = args.join(" ");
        if (!personas[personality])
            return reply(msg, `Personality \`${personality}\` not found`);

        setPersona(personality);

        return reply(msg, `Switched to personality \`${personality}\``);
    },
});
