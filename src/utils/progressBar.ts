const barEmojis = {
    left: {
        full: "<:bar_left_full:1251265391011823777>",
        empty: "<:bar_left_empty:1251265389946736731>"
    },
    middle: {
        full: "<:bar_middle_full:1251266233483923609>",
        empty: "<:bar_middle_empty:1251265393016705096>"
    },
    right: {
        full: "<:bar_right_full:1251265397051756584>",
        empty: "<:bar_right_empty:1251265395923619970>"
    }
};

export function progressBar(val: number, max: number, segments = 8) {
    let bar = "";
    const percentage = Math.floor(val / max * segments);

    for (let i = 0; i < segments; i++) {
        if (percentage > i) bar += "1";
        else bar += "0";
    }

    let emojiBar = "";
    for (let i = 0; i < segments; i++) {
        if (i === 0) {
            if (bar[i] === "1") emojiBar += barEmojis.left.full;
            else emojiBar += barEmojis.left.empty;
            continue;
        }

        if (i !== 0 && i !== segments - 1) {
            if (bar[i] === "1") emojiBar += barEmojis.middle.full;
            else emojiBar += barEmojis.middle.empty;
            continue;
        }

        if (i === segments - 1) {
            if (bar[i] === "1") emojiBar += barEmojis.right.full;
            else emojiBar += barEmojis.right.empty;
            continue;
        }
    }

    return emojiBar;
}
