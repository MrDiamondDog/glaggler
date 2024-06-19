import { exec, execSync } from "child_process";
import fs from "fs";
import path from "path";

// eslint-disable-next-line
export const ytUrlRe = /^(?:(?:https?:)?\/\/)?(?:(?:(?:www|m(?:usic)?)\.)?youtu(?:\.be|be\.com)\/(?:shorts\/|live\/|v\/|e(?:mbed)?\/|watch(?:\/|\?(?:\S+=\S+&)*v=)|oembed\?url=https?%3A\/\/(?:www|m(?:usic)?)\.youtube\.com\/watch\?(?:\S+=\S+&)*v%3D|attribution_link\?(?:\S+=\S+&)*u=(?:\/|%2F)watch(?:\?|%3F)v(?:=|%3D))?|www\.youtube-nocookie\.com\/embed\/)([\w-]{11})[\?&#]?\S*$/;

export function getVideoId(url: string) {
    return url.match(ytUrlRe)?.[1];
}

export function installYTDLP() {
    if (fs.readdirSync(path.resolve(__dirname, "../")).join(" ").includes("ytdlp")) {
        console.log("ytdlp already installed");
        return;
    }

    console.log("installing ytdlp");

    const version = "2024.04.09";

    const linuxURL = `https://github.com/yt-dlp/yt-dlp/releases/download/${version}/yt-dlp`;
    const windowsURL = `https://github.com/yt-dlp/yt-dlp/releases/download/${version}/yt-dlp_x86.exe`;

    if (process.platform === "linux") {
        execSync(`curl -L ${linuxURL} -o ytdlp ytdlp && chmod a+rx ytdlp`);
    } else if (process.platform === "win32") {
        execSync(`curl -L ${windowsURL} -o ytdlp.exe`);
    } else if (process.platform === "darwin") {
        console.log("no macos support");
        process.exit(1);
    }

    console.log("done");
}

export function ytdlpSync(...args: string[]) {
    return execSync(`ytdlp ${args.join(" ")} --no-exec -o "videos/%(id)s/%(id)s.%(ext)s"`).toString();
}

export function ytdlp(...args: string[]) {
    return new Promise((resolve, reject) => {
        let out: string = "";

        const process = exec(`ytdlp ${args.join(" ")} --no-exec -o "videos/%(id)s/%(id)s.%(ext)s"`);

        process.stdout?.on("data", data => out += data);
        process.stderr?.on("data", data => out += data);

        process.on("exit", code => {
            if (code === 0) resolve(out);
            else reject(out);
        });
    });
}
