import { ButtonStyles, ComponentTypes, MessageActionRow, MessageComponent, NullablePartialEmoji } from "oceanic.js";

export function row(...components: MessageComponent[]): MessageActionRow {
    return {
        type: ComponentTypes.ACTION_ROW,
        components
    };
}

export function button(customID: string, label: string, style: number = ButtonStyles.PRIMARY, disabled?: boolean, emoji?: NullablePartialEmoji): MessageComponent {
    return {
        type: ComponentTypes.BUTTON,
        style,
        emoji,
        customID,
        label,
        disabled
    };
}
