import { ButtonStyles, ComponentTypes, MessageActionRow, MessageComponent, NullablePartialEmoji } from "oceanic.js";

export function row(components: MessageComponent[] | MessageComponent): MessageActionRow {
    return {
        type: ComponentTypes.ACTION_ROW,
        components: Array.isArray(components) ? components : [components]
    };
}

export function button(customID: string, label: string, style: number = ButtonStyles.PRIMARY, emoji?: NullablePartialEmoji): MessageComponent {
    return {
        type: ComponentTypes.BUTTON,
        style,
        emoji,
        customID,
        label
    };
}
