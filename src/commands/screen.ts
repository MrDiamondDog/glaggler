import { defineCommand } from "../command";
import { reply } from "../utils";

const API = "https://poetic-correct-crow.ngrok-free.app";

const colors = {
    white: "⬜",
    black: "⬛",
    red: "🟥",
    orange: "🟧",
    yellow: "🟨",
    green: "🟩",
    blue: "🟦",
    purple: "🟪",
};

async function getPixels() {
    const res = await fetch(`${API}/api/pixels`);

    if (!res.ok)
        return "Failed to get pixels: " + res.status;

    const pixels = await res.json() as string[][];

    let str = "";
    for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
            str += colors[pixels[y][x]] || "⬛";
        }
        str += "\n";
    }

    return str;
}

defineCommand({
    name: "screen",
    description: "Changes pixels on drew's screen",
    usage: "screen <x> <y> [white|black|red|orange|yellow|green|blue|purple]",

    async execute(msg, ...args) {
        if (args.length === 0)
            return reply(msg, await getPixels());

        if (args.length < 2) {
            return "Not enough arguments";
        }

        const apiCheck = await fetch(API);

        if (await apiCheck.text() !== "OK")
            return reply(msg, "Failed to connect to screen: " + apiCheck.status);

        const x = parseInt(args[0]);
        const y = parseInt(args[1]);
        const color = args[2] || "white";

        if (isNaN(x) || isNaN(y))
            return "Invalid x or y";

        if (x < 0 || y < 0 || x >= 5 || y >= 5)
            return "x or y out of bounds";

        const res = await fetch(`${API}/api/pixel?x=${x}&y=${y}&color=${color}`);

        if (!res.ok)
            return "Failed to set pixel: " + res.status;

        return reply(msg, await getPixels());
    },
});
