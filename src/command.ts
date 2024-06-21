import { Message } from "oceanic.js";

export interface Command {
    name: string;
    aliases?: string[];
    description: string;
    usage?: string;
    ownerOnly?: boolean;
    execute(message: Message, ...args: string[]): Promise<any> | any;
}

export interface FullCommand extends Command {
    rateLimits: Set<string>;
}

export const Commands = {} as Record<string, FullCommand>;

export function defineCommand(c: Command): void {
    const cmd = c as any as FullCommand;
    cmd.rateLimits = new Set();

    Commands[cmd.name] = cmd;
    cmd.aliases?.forEach(alias => Commands[alias] = cmd);
}
