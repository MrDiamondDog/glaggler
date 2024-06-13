import { ButtonStyles, ComponentTypes, MessageActionRow, MessageComponent } from "oceanic.js";

import { ZWSP } from "../../utils";
import { Fish } from "./types";

export function catchFishButton(user: string, index: number, fish?: Fish): MessageComponent {
    return {
        type: ComponentTypes.BUTTON,
        style: ButtonStyles.SECONDARY,
        customID: `fish-${index}${fish ? "!" : ""}-${user}`,
        label: `${ZWSP}`,
        emoji: fish ? fish.customEmoji || { name: fish.emoji } : undefined,
    };
}

export function catchFishButtonRows(user: string, rows: number, cols: number, fish?: Fish, fishIndex?: number): MessageActionRow[] {
    const components: MessageActionRow[] = [];

    for (let i = 0; i < rows; i++) {
        const row: MessageComponent[] = [];

        for (let j = 0; j < cols; j++) {
            const index = i * cols + j;
            row.push(catchFishButton(user, index, index === fishIndex ? fish : undefined));
        }

        components.push({
            type: ComponentTypes.ACTION_ROW,
            components: row
        });
    }

    return components;
}

export function fishAgainButton(user: string, text: string = "Fish again"): MessageActionRow {
    return {
        type: ComponentTypes.ACTION_ROW,
        components: [{
            type: ComponentTypes.BUTTON,
            style: ButtonStyles.SECONDARY,
            customID: `fish-again-${user}`,
            label: text
        }]
    };
}

export function sellFishButton(user: string): MessageActionRow {
    return {
        type: ComponentTypes.ACTION_ROW,
        components: [{
            type: ComponentTypes.BUTTON,
            style: ButtonStyles.SECONDARY,
            customID: `sell-fish-${user}`,
            label: "Sell fish"
        }]
    };
}
