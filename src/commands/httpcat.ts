import { defineCommand } from "../command";
import { reply } from "../utils";

defineCommand({
    name: "httpcat",
    description: "Get a cat image based on an HTTP status code",
    aliases: ["hcat", "http"],
    usage: "httpcat <status code>",

    async execute(msg, code) {
        if (!code)
            return reply(msg, "You need to provide a status code to get a cat image");

        const num = parseInt(code);
        if (isNaN(num))
            return reply(msg, "The status code must be a number");

        if (num < 100 || num > 599)
            return reply(msg, "https://http.cat/404.jpg");

        const res = await fetch(`https://http.cat/${num}.jpg`);

        if (res.status === 404)
            return reply(msg, "https://http.cat/404.jpg");

        return reply(msg, `https://http.cat/${num}.jpg`);
    },
});
