import { Message } from "discord.js";

export async function delayDelete(messages: Message[], time: number = 10000) {
    setTimeout(async () => {
        for (const m of messages) {
            await m.delete()
        }
    }, time)
}