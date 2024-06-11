import { createCanvas, Image, loadImage, registerFont } from "canvas";

const WIDTH = 400;
const HEIGHT = 260;
const FONT = '"gg sans", "Twemoji Mozilla", "Noto Sans", "Helvetica Neue", Helvetica, Arial, sans-serif';

let img: Image;

interface Channels {
    destCaption: string;
    destCategory: string;
    destChannel: string;
    currentCaption: string;
    currentCategory: string;
    currentChannel: string;
}


function draw(channels: Channels) {
    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(img, 0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "#949ba4";
    ctx.textDrawingMode = "glyph";

    function fitString(str: string, maxWidth: number) {
        let { width } = ctx.measureText(str);
        const ellipsis = "…";
        const ellipsisWidth = ctx.measureText(ellipsis).width;
        if (width <= maxWidth || width <= ellipsisWidth) {
            return str;
        } else {
            let len = str.length;
            while (width >= maxWidth - ellipsisWidth && len-- > 0) {
                str = str.substring(0, len);
                ({ width } = ctx.measureText(str));
            }
            return str + ellipsis;
        }
    }

    function drawCategory(name: string, y: number) {
        ctx.save();

        ctx.font = "600 12px " + FONT;
        // ctx.letterSpacing = "0.24px";
        ctx.fillText(fitString(name.toUpperCase(), 218), 18, y);

        ctx.restore();
    }

    function drawChannel(name: string, y: number) {
        ctx.save();

        ctx.font = "500 16px " + FONT;
        ctx.fillText(fitString(name, 163), 42, y);

        ctx.restore();
    }

    function drawText(color: string, text: string, x: number, y: number) {
        ctx.save();

        ctx.font = "600 25px " + FONT;
        ctx.fillStyle = color;
        ctx.fillText(fitString(text, WIDTH - x), x, y);

        ctx.restore();
    }

    drawCategory(channels.destCategory, 83);
    drawChannel(channels.destChannel, 112);
    drawCategory(channels.currentCategory, 215);
    drawChannel(channels.currentChannel, 244);

    drawText("lime", channels.destCaption.slice(0, 100), 120, 20);
    drawText("red", channels.currentCaption.slice(0, 100), 220, 180);

    return canvas.toBuffer();
}


export async function drawChannelRedirectImage(channels: Channels) {
    if (!img) {
        img = await loadImage("./data/assets/channel-redirect-template.png");

        registerFont("./data/assets/twemoji.ttf", {
            family: "Twemoji Mozilla"
        });

        for (const weight of ["500", "600"]) {
            registerFont(`./data/assets/gg-sans-${weight}.ttf`, {
                family: "gg sans",
                weight
            });
        }
    }

    return draw(channels);
}
