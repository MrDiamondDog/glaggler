import fs from "fs";

export type DataStore<T> = {
    name: string;
    data: T;

    save(): void;
    load(): void;
}

export function createStore<T>(name: string) {
    return {
        name,
        data: {} as T,

        save() {
            fs.writeFileSync(`./data/${name}.json`, JSON.stringify(this.data, null, 4));
        },

        load() {
            try {
                this.data = JSON.parse(fs.readFileSync(`./data/${name}.json`, "utf-8"));
            } catch (e) {
                console.error(`Failed to load data for ${name}: ${e}`);
            }
        }
    };
}
