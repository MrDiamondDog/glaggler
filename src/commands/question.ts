import { ButtonStyles, ComponentTypes, MessageFlags } from "oceanic.js";

import { defineCommand } from "../command";
import { activeQuestion, setActiveQuestion } from "../modules/question";
import { reply } from "../utils";

defineCommand({
    name: "question",
    description: "Ask a question that users respond to anonymously",
    aliases: ["que"],
    usage: "question <question>",
    execute(msg, ...args) {
        if (activeQuestion)
            return reply(msg, {
                content: "There is already an active question",
                flags: MessageFlags.EPHEMERAL
            });

        const question = args.join(" ");
        if (!question) return;

        setActiveQuestion({
            id: msg.author.id,
            question,
            answers: new Map<string, string>()
        });

        return reply(msg, {
            content: `**Question:** ${question}`,
            components: [{
                type: ComponentTypes.ACTION_ROW,
                components: [{
                    type: ComponentTypes.BUTTON,
                    style: ButtonStyles.PRIMARY,
                    customID: "answer-" + msg.author.id,
                    label: "Answer",
                }, {
                    type: ComponentTypes.BUTTON,
                    style: ButtonStyles.SECONDARY,
                    customID: "endquestion-" + msg.author.id,
                    label: "Close",
                }]
            }]
        });
    }
});
