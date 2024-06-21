import { AudioPlayer, AudioPlayerStatus, AudioResource, createAudioPlayer, createAudioResource, joinVoiceChannel,StreamType, VoiceConnection } from "@discordjs/voice";
import fs from "fs";
import { VoiceState } from "oceanic.js";
import yts from "yt-search";

import { secondsToTime } from "./../utils";
import { getVideoId, ytdlp } from "./ytdlp";

type VideoInfo = {
    title: string;
    timeStr: string;
    seconds: number;
    progress: number;
    url: string;
}

type MusicData = {
    voiceConnection?: VoiceConnection;
    audioResource?: AudioResource;
    audioPlayer?: AudioPlayer;
    progressInterval?: NodeJS.Timeout;
    queue: VideoInfo[];
}

export let currentMusicData: MusicData | undefined = undefined;

async function getVideoInfo(url: string): Promise<VideoInfo> {
    const id = getVideoId(url);
    await ytdlp("--skip-download", "--write-info-json", `https://www.youtube.com/watch?v=${id}`);

    const rawData = JSON.parse(fs.readFileSync(`videos/${id}/${id}.info.json`, "utf-8"));

    return {
        title: rawData.title,
        timeStr: secondsToTime(rawData.duration),
        seconds: rawData.duration,
        progress: 0,
        url: `https://youtube.com/watch?v=${id}`
    };
}

async function downloadYT(url: string) {
    const id = getVideoId(url);

    await ytdlp(`https://youtube.com/watch?v=${id} -f bestaudio`);

    const file = fs.readdirSync(`videos/${id}`).find(file => !file.endsWith("json"));
    return fs.createReadStream(`videos/${id}/${file}`);
}

export async function youtubeSearch(query: string): Promise<string | undefined> {
    const search = await yts(query);
    return search.videos?.[0]?.url;
}

export async function play(voiceState: VoiceState, url: string): Promise<VideoInfo & { queued?: boolean }> {
    if (currentMusicData) {
        const info = await getVideoInfo(url);
        currentMusicData.queue.push(info);
        return { ...info, queued: true };
    }

    currentMusicData = { queue: [] };

    const audioPlayer = createAudioPlayer();
    const voiceConnection = joinVoiceChannel({
        adapterCreator: voiceState.guild.voiceAdapterCreator,
        channelId: voiceState.channelID!,
        guildId: voiceState.guildID,
        selfDeaf: true
    });
    voiceConnection.subscribe(audioPlayer);
    voiceConnection.on("error", error => console.error(error));

    const video = await downloadYT(url);
    const info = await getVideoInfo(url);

    const audioResource = createAudioResource(video, {
        silencePaddingFrames: 5,
        inputType: StreamType.Arbitrary
    });

    audioPlayer.play(audioResource);

    const interval = setInterval(() => {
        info.progress += 1;
    }, 1000);

    currentMusicData = {
        voiceConnection,
        audioPlayer,
        audioResource,
        progressInterval: interval,
        queue: [info]
    };

    audioPlayer
        .on(AudioPlayerStatus.Idle, () => {
            if (currentlySkipping) return;
            skip();
        })
        .on("error", error => {
            console.error(error);
            skip();
        });

    return info;
}

let currentlySkipping = false;
export async function skip() {
    if (!currentMusicData || !currentMusicData.audioPlayer) return;

    currentlySkipping = true;

    clearInterval(currentMusicData.progressInterval!);
    currentMusicData.audioPlayer.stop();
    currentMusicData.queue.shift();

    if (!currentMusicData.queue?.[0]) return stop();

    const video = await downloadYT(currentMusicData.queue[0].url);

    const audioResource = createAudioResource(video, {
        silencePaddingFrames: 5,
        inputType: StreamType.Arbitrary
    });

    currentMusicData.audioResource = audioResource;
    currentMusicData.audioPlayer.play(audioResource);

    currentMusicData.queue[0].progress = 0;
    const interval = setInterval(() => {
        if (!currentMusicData) return;
        currentMusicData.queue[0].progress += 1;
    }, 1000);

    currentMusicData.progressInterval = interval;

    currentlySkipping = false;
}

export function stop() {
    if (!currentMusicData || !currentMusicData.voiceConnection) return;

    clearInterval(currentMusicData.progressInterval!);
    currentMusicData.voiceConnection.destroy();
    currentMusicData = undefined;
}
