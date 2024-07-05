import { execSync } from "child_process";
import fs from "fs";

/**
 * Unzips a file to data/unzipped/<filename>
 * @param path The path to the file relative to the data folder
 * @param filename The name of the file
 */
export function unzip(path: string, filename: string) {
    if (!fs.existsSync("data/unzipped"))
        fs.mkdirSync("data/unzipped");

    if (!fs.existsSync(`data/unzipped/${filename}`))
        fs.mkdirSync(`data/unzipped/${filename}`);

    if (process.platform === "win32")
        return execSync(`cd data/unzipped/${filename} && tar -xf "../../${path}"`);
    else
        return execSync(`cd data/unzipped/${filename} && unzip "../../${path}"`);
}

/**
 * Downloads a file to data/<path>
 * @param url The URL to download the file from
 * @param path The path to save the file to relative to the data folder
 */
export function download(url: string, path: string) {
    return execSync(`curl -o "data/${path}" "${url}"`);
}
