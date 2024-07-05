import fs from "fs";

import { defineCommand } from "../command";
import { createStore } from "../modules/dataStore";
import { codeblock, edit, paginatedMessage, reply, stripIndent, upload } from "../utils";
import { download, unzip } from "../utils/fs";

const ModpackStore = createStore<Record<string, Modpack>>("modpacks");
ModpackStore.load();

const modrinthApi = "https://api.modrinth.com/v2";
const userAgent = "User-Agent: MrDiamondDog/glaggler/1.0";
const downloadUrlRe = /https:\/\/cdn\.modrinth\.com\/data\/([a-zA-Z0-9]+)\/versions\/([a-zA-Z0-9]+)\/(.+\.jar)/;

type RawModpack = {
  game: string;
  formatVersion: number;
  versionId: string;
  name: string;
  summary: string;
  files: RawFile[];
  dependencies: Record<string, string>;
}

type RawFile = {
  path: string;
  hashes: {
    sha1: string;
    sha512: string;
  };
  env: {
    client: string;
    server: string;
  };
  downloads: string[];
  fileSize: number;
}

type Modpack = {
    name: string;
    dependencies: Record<string, string>
    mods: Mod[];
}

type Mod = {
    name: string;
    description?: string;
    version: string;
    id?: string;
    url?: string;
    downloadUrl?: string;
}

defineCommand({
    name: "modpacks",
    description: "Manage minecraft mods",
    aliases: ["modpack", "mods"],
    usage: "modpacks <create|edit|delete|list|mods|info|download> [name] [.mrpack file|url]",

    async execute(msg, ...args) {
        const subcommand = args.shift();
        if (!subcommand) {
            return reply(msg, "Please provide a subcommand");
        }

        if (subcommand === "create" || subcommand === "edit") {
            const name = args.shift();
            if (!name)
                return reply(msg, "Please provide a name for the modpack");

            const file = msg.attachments.first();
            let url = "";
            if (!file || !file.filename.endsWith(".mrpack"))
                if (args[0] && args[0].startsWith("http"))
                    url = args.shift()!;
                else
                    return reply(msg, "Please attach a .mrpack file or provide a URL");
            else
                // eslint-disable-next-line
                url = file.url;

            const botMsg = await reply(msg, "Downloading...");

            fs.mkdirSync(`data/modpacks/${name}`, { recursive: true });

            download(url, `modpacks/${name}/pack.mrpack`);

            edit(botMsg.id, botMsg.channelID, "Unpacking...");
            unzip(`modpacks/${name}/pack.mrpack`, `modpack_${name}`);

            edit(botMsg.id, botMsg.channelID, "Parsing...");

            const rawModpack = JSON.parse(fs.readFileSync(`data/unzipped/modpack_${name}/modrinth.index.json`, "utf-8")) as RawModpack;
            const mods: Mod[] = [];

            for (const mod of rawModpack.files) {
                if (!mod.path.startsWith("mods/")) continue;

                const [_, id, version] = downloadUrlRe.exec(mod.downloads[0])!;

                const modData = await fetch(`${modrinthApi}/project/${id}`, { headers: { "User-Agent": userAgent } })
                    .then(res => res.json()) as any;
                const versionData = await fetch(`${modrinthApi}/project/${id}/version/${version}`, { headers: { "User-Agent": userAgent } })
                    .then(res => res.json()) as any;

                if (modData.error || versionData.error) {
                    console.error(modData, versionData);
                    return reply(msg, "Error fetching mod data");
                }

                mods.push({
                    name: modData.title,
                    description: modData.description,
                    version: versionData.name.replace(`${modData.title} `, ""),
                    id,
                    url: `https://modrinth.com/mod/${id}`,
                    downloadUrl: mod.downloads[0]
                });
            }

            const modpack = {
                name,
                dependencies: rawModpack.dependencies,
                mods
            };

            if (fs.existsSync(`data/unzipped/modpack_${name}/overrides/mods`)) {
                const modFiles = fs.readdirSync(`data/unzipped/modpack_${name}/overrides/mods`);
                for (const file of modFiles) {
                    const [name, ...version] = file.split(".jar")[0].split("-");

                    modpack.mods.push({
                        name,
                        version: version.join("-")
                    });
                }
            }

            let oldModpack: Modpack | undefined;
            if (subcommand === "edit") {
                oldModpack = ModpackStore.data[name];
            }
            ModpackStore.data[name] = modpack;
            ModpackStore.save();

            if (subcommand === "edit") {
                if (!oldModpack)
                    return reply(msg, "Modpack not found");

                const added = modpack.mods.filter(mod => !oldModpack.mods.find(oldMod => oldMod.name === mod.name));
                const removed = oldModpack.mods.filter(mod => !modpack.mods.find(newMod => newMod.name === mod.name));
                const modified = modpack.mods.filter(mod => {
                    const oldMod = oldModpack.mods.find(oldMod => oldMod.name === mod.name);
                    return oldMod && oldMod.version !== mod.version;
                });

                let out = stripIndent`
                    **${name}**
                    ${codeblock(stripIndent`
                        ${added.map(mod => `+ ${mod.name} - ${mod.version}`).join("\n")}
                        ${removed.map(mod => `- ${mod.name} - ${mod.version}`).join("\n")}

                        ${modified.map(mod => `${mod.name}\n- ${oldModpack.mods.find(m => m.name === mod.name)!.version}\n+ ${mod.version}`).join("\n")}
                    `, "diff")}
                `;

                if (out.length > 1900)
                    out = stripIndent`
                        **${name}**
                        
                        Added: ${added.length} mods
                        Removed: ${removed.length} mods
                        Modified: ${modified.length} mods
                    `;

                return reply(msg, out);
            } else
                edit(botMsg.id, botMsg.channelID, `Done!\n\` + ${mods.length} mods\``);

            fs.rmdirSync(`data/unzipped/modpack_${name}`, { recursive: true });
        } else if (subcommand === "mods") {
            const modpackName = args.shift();
            if (!modpackName)
                return reply(msg, "Please provide a modpack name");

            const modpack = ModpackStore.data[modpackName];
            if (!modpack)
                return reply(msg, "Modpack not found");

            const out = modpack.mods.map(mod => `**${mod.url ? `[${mod.name}](<${mod.url}>)` : mod.name}** ${mod.downloadUrl ? `([download](${mod.downloadUrl}))` : ""} - \`${mod.version}\``);

            paginatedMessage(msg.channelID, `${modpack.mods.length} Mods ({{page}}/{{max_pages}})`, out, 7);

        } else if (subcommand === "list") {
            const modpacks = Object.keys(ModpackStore.data);
            if (!modpacks.length)
                return reply(msg, "No modpacks found");

            const out = modpacks.map(modpack => `**${modpack}** - ${ModpackStore.data[modpack].mods.length} mods`);

            paginatedMessage(msg.channelID, `${modpacks.length} Modpacks ({{page}}/{{max_pages}})`, out);

            return;
        } else if (subcommand === "delete") {
            const modpackName = args.shift();
            if (!modpackName)
                return reply(msg, "Please provide a modpack name");

            if (!ModpackStore.data[modpackName])
                return reply(msg, "Modpack not found");

            delete ModpackStore.data[modpackName];
            ModpackStore.save();

            fs.rmdirSync(`data/modpacks/${modpackName}`, { recursive: true });

            return reply(msg, "Modpack deleted");
        } else if (subcommand === "info") {
            const modpackName = args.shift();
            if (!modpackName)
                return reply(msg, "Please provide a modpack name");

            const modpack = ModpackStore.data[modpackName];
            if (!modpack)
                return reply(msg, "Modpack not found");

            const out = stripIndent`**${modpack.name}**
**${modpack.mods.length}** mods

${Object.entries(modpack.dependencies).map(([key, value]) => `**${key}**: ${value}`).join("\n")}`;

            return reply(msg, out);
        } else if (subcommand === "download") {
            const modpackName = args.shift();
            if (!modpackName)
                return reply(msg, "Please provide a modpack name");

            const modpack = ModpackStore.data[modpackName];
            if (!modpack)
                return reply(msg, "Modpack not found");

            upload(msg.channelID, modpackName + ".mrpack", fs.readFileSync(`data/modpacks/${modpackName}/pack.mrpack`));
        } else {
            return reply(msg, "Invalid subcommand");
        }
    }
});
