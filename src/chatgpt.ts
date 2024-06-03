import { G4F } from "g4f";

const gpt = new G4F();

export async function askGpt(system: string, message: string): Promise<string> {
    return await gpt.chatCompletion([
        // `role: "system"` doesn't do anything for some god awful reason
        { role: "user", content: system },
        { role: "assistant", content: "You bet! I will be that character as accurately as possible." },
        { role: "user", content: message }
    ], {
        model: "ada"
    });
}
