
import { MessageFlags } from "oceanic.js";

import { Glaggler } from "../client";
import { defineCommand } from "../command";
import { currentMusicData, play, playFile, skip, spotifyRe, stop, youtubeRe, youtubeSearch } from "../modules/music";
import { edit, reply, stripIndent } from "../utils";
import { progressBar } from "../utils/progressBar";
import { secondsToTime } from "./../utils";

defineCommand({
    name: "music",
    description: "Music controls",
    aliases: ["m"],

    usage: "music <play|stop|queue|pause|resume|skip> [query|url]",

    async execute(msg, ...args) {
        if (!args.length) return reply(msg, "Please provide a subcommand (play, stop, skip, queue, pause, resume, loop)");

        if (!msg.member!.voiceState?.channel) return reply(msg, "You must be in a voice channel to use this command");

        if (msg.embeds.length)
            Glaggler.rest.channels.getMessage(msg.channelID, msg.id)
                .then(msg => msg.edit({ flags: MessageFlags.SUPPRESS_EMBEDS }));

        const subcommand = args[0]!.toLowerCase();

        switch (subcommand) {
            case "play":
                if (!args[1]) return reply(msg, "Please provide a query or URL");
                const botMsg = await reply(msg, { content: "Downloading...", flags: MessageFlags.SUPPRESS_EMBEDS });

                let url = args[1];

                if (!args[1].startsWith("http")) {
                    edit(botMsg.id, botMsg.channelID, "Searching...");

                    const searchedUrl = await youtubeSearch(args.slice(1).join(" "));
                    if (!searchedUrl) return reply(msg, "No results found");
                    url = searchedUrl;
                } else {
                    if (!youtubeRe.test(url) && !spotifyRe.test(url)) return reply(msg, "Invalid URL. Only YouTube and Spotify URLs are supported. Playlists are only supported by YouTube URLs.");
                }

                edit(botMsg.id, botMsg.channelID, "Downloading...");

                const info = await play(msg.member!.voiceState!, url);

                if (info.queued) return edit(botMsg.id, botMsg.channelID, `[${info.title}](${info.url}) Queued`);
                else return edit(botMsg.id, botMsg.channelID, `Now Playing: [${info.title}](${info.url})`);
            case "stop":
                if (!currentMusicData) return reply(msg, "No music is currently playing");

                return stop();
            case "queue":
                if (!currentMusicData || currentMusicData.queue.length === 0) return reply(msg, "No music is currently playing");

                const currentSong = currentMusicData.queue[0];

                let queueMsg = stripIndent`
                ${currentSong.title} (${secondsToTime(currentSong.seconds)})
                ${secondsToTime(currentSong.progress)} ${progressBar(currentSong.progress, currentSong.seconds, 10)} ${secondsToTime(currentSong.seconds)}`;
                queueMsg += "\n\n" + currentMusicData.queue.map((info, i) => `${i + 1}. [${info.title}](${info.url}) (${secondsToTime(info.seconds)})`).join("\n");

                return reply(msg, { content: queueMsg, flags: MessageFlags.SUPPRESS_EMBEDS });
            case "pause":
                if (!currentMusicData || !currentMusicData.audioPlayer) return reply(msg, "No music is currently playing");

                currentMusicData.audioPlayer.pause();

                return reply(msg, "Paused");
            case "resume":
                if (!currentMusicData || !currentMusicData.audioPlayer) return reply(msg, "No music is currently playing");

                const unpaused = currentMusicData.audioPlayer.unpause();

                if (!unpaused) return reply(msg, "Player is not paused");
                return reply(msg, "Resumed");
            case "skip":
                if (!currentMusicData || currentMusicData.queue.length === 0) return reply(msg, "No music is currently playing");

                if (msg.author.id === "722264513021476986") return reply(msg, "no");

                await skip();

                return reply(msg, "Skipped");
            case "count":
                return playFile(msg.member!.voiceState!, "data/assets/Ten.mp3");
            default:
                return reply(msg, "Invalid subcommand");
        }
    },
});
