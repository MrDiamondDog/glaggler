import { defineCommand } from "../command";
import { reply } from "../utils";

const httpCodes = [ 100, 101, 102, 103, 200, 201, 202, 203, 204, 205, 206, 207, 208, 226, 300, 301, 302, 303, 304, 305, 307, 308, 400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 419, 420, 421, 422, 423, 424, 425, 426, 428, 429, 431, 444, 450, 451, 499, 500, 501, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511, 598, 599 ];

defineCommand({
    name: "httpcat",
    description: "Get a cat image based on an HTTP status code",
    aliases: ["hcat", "http"],
    usage: "httpcat [status code]",

    async execute(msg, code) {
        if (!code)
            return reply(msg, `https://http.cat/${httpCodes[Math.floor(Math.random() * httpCodes.length)]}.jpg`);

        const num = parseInt(code);
        if (isNaN(num))
            return reply(msg, "The status code must be a number");

        if (!httpCodes.includes(num))
            return reply(msg, "https://http.cat/404.jpg");

        return reply(msg, `https://http.cat/${num}.jpg`);
    },
});
