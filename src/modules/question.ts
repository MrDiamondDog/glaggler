import { ComponentInteraction, ComponentTypes, MessageFlags, ModalSubmitInteraction, TextInputStyles } from "oceanic.js";

import { Glaggler } from "../client";

type Question = {
    id: string;
    question: string;
    answers: Map<string, string>;
}

export let activeQuestion: Question | null = null;

export function setActiveQuestion(question: Question) {
    activeQuestion = question;
}

Glaggler.on("interactionCreate", async interaction => {
    if (!activeQuestion) return;
    if (!interaction.isComponentInteraction()) return;

    const button = interaction as ComponentInteraction;

    if (button.data.customID.startsWith("endquestion-")) {
        const originalId = button.data.customID.split("-")[1];

        if (originalId !== button.user.id)
            return button.reply({
                content: "this isn't your question",
                flags: MessageFlags.EPHEMERAL
            });

        await interaction.editParent({
            content: `**Question:** ${activeQuestion.question}\n\n**Answers:**\n${[...activeQuestion.answers.values()].map((answer, i) => `${i + 1}. ${answer}`).join("\n")}`,
            components: []
        });

        activeQuestion = null;
    } else if (button.data.customID.startsWith("answer-")) {
        const originalId = button.data.customID.split("-")[1];

        if (originalId === button.user.id)
            return button.reply({
                content: "you cant answer your own question silly",
                flags: MessageFlags.EPHEMERAL
            });

        if (activeQuestion.answers.has(button.user.id))
            return button.reply({
                content: "you already answered this question",
                flags: MessageFlags.EPHEMERAL
            });

        await interaction.createModal({
            title: "Answer",
            customID: "answermodal-" + originalId,
            components: [{
                type: ComponentTypes.ACTION_ROW,
                components: [{
                    type: ComponentTypes.TEXT_INPUT,
                    style: TextInputStyles.PARAGRAPH,
                    customID: "answertext-" + originalId,
                    label: "Your answer",
                }]
            }]
        });
    }
});

Glaggler.on("interactionCreate", async interaction => {
    if (!activeQuestion) return;
    if (!interaction.isModalSubmitInteraction()) return;

    const modal = interaction as ModalSubmitInteraction;

    if (!modal.data.customID.startsWith("answermodal-")) return;

    const answer = modal.data.components.raw[0].components[0].value;
    if (!answer) return;

    activeQuestion!.answers.set(modal.user.id, answer);

    await interaction.editParent({
        content: `**Question:** ${activeQuestion.question}\n**${activeQuestion.answers.size}** submissions`,
    });
});
