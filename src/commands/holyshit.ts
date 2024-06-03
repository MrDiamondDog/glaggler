import { defineCommand } from "../command";
import { reply } from "../utils";

defineCommand({
    name: "holyshit",
    description: "HOLY SHIT",

    execute(message, ...args) {
        return reply(message, "https://cdn.discordapp.com/attachments/1137221369084514334/1246984936817426442/FIkBu_BUcAAh0dh.png?ex=665e60b8&is=665d0f38&hm=ccab1a05d424f6dc7bd9dad78fdac05e6b6b8916c39fa896376d0a14199ab1ae&");
    },
});
