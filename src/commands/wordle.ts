import fs from "fs";
import { Message } from "oceanic.js";

import { PREFIX } from "../client";
import { defineCommand } from "../command";
import { edit, reply } from "../utils";

type WordleGame = {
    word: string;
    guesses: string[];
    guessResults: string[];
    maxGuesses: number;
    message: Message;
};

const squares = {
    green: "🟩",
    yellow: "🟨",
    gray: "⬛",
};

const words = JSON.parse(fs.readFileSync("./data/assets/words.json", "utf8")) as string[];
const games: Record<string, WordleGame> = {};

defineCommand({
    name: "wordle",
    description: "you know the rules",
    usage: "wordle [word length = 5|guess <word>]",

    async execute(msg, ...args) {
        if (args?.[0] === "guess") {
            const game = games[msg.author.id];
            const guess = args[1];

            if (!game)
                return reply(msg, "start a game first");

            if (!guess)
                return reply(msg, "make a guess silly");

            if (guess.length !== game.word.length)
                return reply(msg, "wrong length");

            const validWords = words.filter(w => w.length === wordLength);

            if (!validWords.includes(guess))
                return reply(msg, "word not found");

            let out = "";
            const correctLetters: string[] = " ".repeat(game.word.length).split("");
            for (let i = 0; i < game.word.length; i++) {
                const guessLetter = guess[i];
                const correctLetter = game.word[i];

                if (guessLetter === correctLetter)
                    correctLetters[i] = correctLetter;
            }

            for (let i = 0; i < game.word.length; i++) {
                const guessLetter = guess[i];
                const correctLetter = game.word[i];

                if (guessLetter === correctLetter)
                    out += squares.green;
                else if (game.word.includes(guessLetter) && correctLetters.filter(l => l === guessLetter).length !== game.word.split("").filter(l => l === guessLetter).length)
                    out += squares.yellow;
                else
                    out += squares.gray;
            }

            game.guessResults.push(out);

            if (game.guessResults.length >= game.maxGuesses) {
                edit(game.message.id, game.message.channelID, `you lost, the word was **${game.word}**\n${game.guessResults.join("\n")}`);
                delete games[msg.author.id];
                return;
            }

            if (guess === game.word) {
                edit(game.message.id, game.message.channelID, `you won, the word was **${game.word}**\n${game.guessResults.join("\n")}`);
                delete games[msg.author.id];
                return;
            }

            return edit(game.message.id, game.message.channelID, `${game.guessResults.length}/${game.maxGuesses}\n${game.guessResults.join("\n")}`);
        }

        if (games[msg.author.id])
            return reply(msg, "you already have a game in progress");

        const wordLength = parseInt(args[0]) || 5;

        if (wordLength > 15 || wordLength <= 0)
            return reply(msg, "invalid word length");

        const validWords = words.filter(w => w.length === wordLength);
        const word = validWords[Math.floor(Math.random() * validWords.length)];

        const botMsg = await reply(msg, `guess by typing \`${PREFIX}wordle guess <word>\``);

        games[msg.author.id] = { word, guesses: [], message: botMsg, guessResults: [], maxGuesses: Math.max(6, wordLength + 1) };
    },
});
