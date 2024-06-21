import { AudioPlayer, AudioPlayerStatus, AudioResource, createAudioPlayer, createAudioResource, joinVoiceChannel,StreamType, VoiceConnection } from "@discordjs/voice";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { VoiceState } from "oceanic.js";
import yts from "yt-search";
import ytdl from "ytdl-core";

const Spotify = SpotifyApi.withClientCredentials(process.env.SPOTIFY_CLIENT_ID!, process.env.SPOTIFY_CLIENT_SECRET!);
export const spotifyRe = /(https?:\/\/open.spotify.com\/(track)\/([a-zA-Z0-9]+))/;
export const youtubeRe = /(https?:\/\/(?:www\.)?((?:youtu\.be\/.{4,16})|(youtube\.com\/watch\?v=.{4,16})))/gim;

type VideoInfo = {
    title: string;
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

function toVideoInfo(info: ytdl.videoInfo): VideoInfo {
    return {
        title: info.videoDetails.title,
        seconds: parseInt(info.videoDetails.lengthSeconds),
        progress: 0,
        url: info.videoDetails.video_url
    };
}

async function getVideoInfo(url: string): Promise<VideoInfo> {
    const info = await ytdl.getInfo(url);

    return toVideoInfo(info);
}

export async function youtubeSearch(query: string): Promise<string | undefined> {
    const search = await yts(query);
    return search.videos?.[0]?.url;
}

export async function play(voiceState: VoiceState, url: string): Promise<VideoInfo & { queued?: boolean }> {
    if (spotifyRe.test(url)) {
        const spotifyURL = url?.match(spotifyRe);
        const trackID = spotifyURL?.[3];

        if (!trackID) throw "Invalid Spotify URL";

        const track = await Spotify.tracks.get(trackID);
        const youtubeUrl = await youtubeSearch(`${track.artists.map(a => a.name).join(", ")} - ${track.name}`);

        if (!youtubeUrl) throw "No results found";

        url = youtubeUrl;
    }

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

    const rawInfo = await ytdl.getInfo(url);
    const info = toVideoInfo(rawInfo);

    const audioResource = createAudioResource(ytdl.downloadFromInfo(rawInfo, {
        filter: "audioonly",
        quality: "highestaudio",
        dlChunkSize: 0,
        highWaterMark: 1 << 25
    }), {
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

    const info = await ytdl.getInfo(currentMusicData.queue[0].url);

    const audioResource = createAudioResource(ytdl.downloadFromInfo(info, {
        filter: "audioonly",
        quality: "highestaudio",
        dlChunkSize: 0,
        highWaterMark: 1 << 25
    }), {
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
