import fs from "fs";

import { Glaggler, PREFIX } from "../client";

export const generalChannel = "1094818966830055458";

export let currentConvo: string | null = null;
export function setCurrentConvo(user: string | null) {
    currentConvo = user;
}

export function cacheMessages(messages: string[]) {
    if (!fs.existsSync("messages.json"))
        fs.writeFileSync("messages.json", "[]");

    fs.writeFileSync("messages.json", JSON.stringify(messages));
}

export function getMessages() {
    return JSON.parse(fs.readFileSync("messages.json", "utf8")) as string[];
}

Glaggler.on("messageCreate", async msg => {
    if (msg.channel?.id !== generalChannel || msg.author.id === Glaggler.user.id) return;
    if (msg.content.startsWith(PREFIX)) return;

    if (currentConvo && msg.author.id === currentConvo) {
        msg.channel?.createMessage({ content: josh(getMessages()) });
        return;
    }

    const messages = getMessages();

    messages.push(msg.content);

    cacheMessages(messages);
});

export function josh(messages: string[]) {
    const transitions = {};
    const startStates: string[] = [];

    function addToChain(text: string) {
        const words = text.toLowerCase().split(" ");
        if (!words) return;

        startStates.push(words[0]);

        for (let i = 0; i < words.length - 1; i++) {
            const currentWord = words[i];
            const nextWord = words[i + 1];

            if (!transitions[currentWord]) {
                transitions[currentWord] = [];
            }
            transitions[currentWord].push(nextWord);
        }
    }

    messages.forEach(addToChain);

    function generateSentence() {
        let currentWord = startStates[Math.floor(Math.random() * startStates.length)];
        const sentence = [currentWord];

        while (transitions[currentWord] && transitions[currentWord].length > 0) {
            const possibleNextWords = transitions[currentWord];
            currentWord = possibleNextWords[Math.floor(Math.random() * possibleNextWords.length)];
            sentence.push(currentWord);
        }

        return sentence.join(" ");
    }

    return generateSentence();
}
