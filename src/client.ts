import fs from "fs";
import { ActivityTypes, AnyTextableChannel, Client, Message } from "oceanic.js";

import { Commands } from "./command";
import { codeblock, reply, send } from "./utils";

export const PREFIX = ";";

export const Glaggler = new Client({
    auth: "Bot " + process.env.DISCORD_TOKEN,
    gateway: { intents: ["ALL"] },
    allowedMentions: {
        everyone: true,
        repliedUser: true,
        roles: true,
        users: true
    }
});

Glaggler.once("ready", async () => {
    console.log(`Connected as ${Glaggler.user.tag} (${Glaggler.user.id})`);
    console.log(`I am in ${Glaggler.guilds.size} guilds`);
    console.log(`https://discord.com/oauth2/authorize?client_id=${Glaggler.user.id}&permissions=8&scope=bot+applications.commands`);

    Glaggler.editStatus("online", [
        {
            name: "custom",
            state: "straight fish box",
            type: ActivityTypes.CUSTOM
        }
    ]);

    if (fs.existsSync("./data/assets/restart-data.json")) {
        const restartData = JSON.parse(fs.readFileSync("./data/assets/restart-data.json", "utf8"));
        fs.rmSync("./data/assets/restart-data.json");
        send(restartData.channelID, `im back :3${restartData.files ? `\n\`${restartData.files}\`` : ""}`);
    }
});

Glaggler.on("messageCreate", async message => {
    if (!message.content.startsWith(PREFIX)) return;

    const content = message.content.slice(PREFIX.length).trim();
    const args = content.split(" ");

    const cmdName = args.shift()!;
    const cmd = Commands[cmdName];
    if (!cmd) return;

    if (!message.channel)
        await message.client.rest.channels.get(message.channelID);

    if (cmd.ownerOnly && message.author.id !== "523338295644782592") {
        return reply(message, "You are not allowed to use this command");
    }

    try {
        console.log("Running", cmd.name, "with args", args);
        await cmd.execute(message as Message<AnyTextableChannel>, ...args);
    } catch (error: any) {
        console.error(
            `Failed to run ${cmd.name}`,
            `\n> ${message.content}\n`,
            error
        );

        if (error.code === "ERR_BAD_REQUEST" || error.code === "ERR_BAD_RESPONSE") {
            reply(message, `https://http.cat/${error.response.status}.jpg`);
        } else {
            reply(message, "https://tenor.com/view/brain-damage-gif-25961554");
        }

        send(message.channelID, `Error while executing command ${cmd.name}\n${codeblock(error || error.message || "Unknown error")}`);
    }
});
