import { ButtonStyles, ComponentTypes } from "oceanic.js";

import { defineCommand } from "../command";
import { clickData } from "../modules/clicker_game";
import { reply } from "../utils";


defineCommand({
    name: "clicker",
    description: "Clicker game",

    execute(msg, ...args) {
        return reply(msg, {
            content: clickData[msg.author.id]?.clicks.toString() || "0",
            components: [{
                type: ComponentTypes.ACTION_ROW,
                components: [{
                    type: ComponentTypes.BUTTON,
                    style: ButtonStyles.PRIMARY,
                    customID: "click-" + msg.author.id,
                    label: "Click",
                }]
            }]
        });
    },
});
