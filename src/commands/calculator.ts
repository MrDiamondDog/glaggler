import { defineCommand } from "../command";
import { reply } from "../utils";

defineCommand({
    name: "calculator",
    description: "stupid fuckin calculator",
    aliases: ["calc"],
    usage: "calculator <number1> <operation> <number2>",

    async execute(msg, ...args) {
        if (args.length !== 3) {
            return reply(msg, "Invalid arguments");
        }

        const number1 = parseFloat(args[0]);
        const operation = args[1];
        const number2 = parseFloat(args[2]);

        let result: number;
        switch (operation) {
            case "+":
                result = number1 + number2;
                break;
            case "-":
                result = number1 - number2;
                break;
            case "*":
                result = number1 * number2;
                break;
            case "/":
                result = number1 / number2;
                break;
            default:
                return reply(msg, "https://http.cat/418.jpg");
        }

        if (number1 === 143 || number2 === 143)
            return reply(msg, "omor :skull:");

        if (number1 === 10000 && number2 === 10000 && operation === "-")
            return reply(msg, "8");
        return reply(msg, result.toString());
    }
});
