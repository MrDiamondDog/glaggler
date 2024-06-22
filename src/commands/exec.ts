
import { defineCommand } from "../command";
import { inspect } from "../utils/inspect";
import { codeblock, reply } from "./../utils";

defineCommand({
    name: "exec",
    description: "run js code (please dont fuck up my computer)",
    ownerOnly: true,
    usage: "exec <js codeblock>",

    async execute(msg, ...args) {
        const console: any = {
            _lines: [] as string[],
            _log(...things: string[]) {
                this._lines.push(
                    ...things
                        .map(x => inspect(x, { getters: true }))
                        .join(" ")
                        .split("\n")
                );
            }
        };
        console.log = console.error = console.warn = console.info = console._log.bind(console);

        let script = args.join(" ").replace(/(^`{3}(js|javascript)?|`{3}$)/g, "");
        if (script.includes("await")) script = `(async () => { ${script} })()`;

        try {
            var result = await eval(script);
        } catch (e: any) {
            var result = e;
        }

        const res = inspect(result, { getters: true }).slice(0, 1990);

        let output = codeblock(res, "js");
        const consoleOutput = console._lines.join("\n").slice(0, Math.max(0, 1990 - output.length));

        if (consoleOutput) output += `\n${codeblock(consoleOutput)}`;


        return reply(msg, output);
    },
});
