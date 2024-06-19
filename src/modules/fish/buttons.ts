import { ButtonStyles, MessageActionRow, MessageComponent } from "oceanic.js";

import { ZWSP } from "../../utils";
import { button, row } from "../../utils/components";
import { Fish } from "./types";

export function catchFishButton(user: string, index: number, fish?: Fish): MessageComponent {
    return button(
        `fish_${index}${fish ? "!" : ""}-${user}`,
        `${ZWSP}`,
        ButtonStyles.SECONDARY,
        fish ? fish.customEmoji || { name: fish.emoji } : undefined
    );
}

export function catchFishButtonRows(user: string, rows: number, cols: number, fish?: Fish, fishIndex?: number): MessageActionRow[] {
    const components: MessageActionRow[] = [];

    for (let i = 0; i < rows; i++) {
        const buttons: MessageComponent[] = [];

        for (let j = 0; j < cols; j++) {
            const index = i * cols + j;
            buttons.push(catchFishButton(user, index, index === fishIndex ? fish : undefined));
        }

        components.push(row(...buttons));
    }

    return components;
}

export function startFishButton(user: string, text: string = "Start Fishing"): MessageComponent {
    return button("startfish-" + user, text, ButtonStyles.PRIMARY);
}

export function sellFishButton(user: string): MessageComponent {
    return button("sellfish-" + user, "Sell Fish", ButtonStyles.SECONDARY);
}
