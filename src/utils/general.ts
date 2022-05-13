import { Message } from "discord.js";

/**
 * Deletes a message or group of messages after a given time
 * @param messages Array of messges to delete
 * @param time Time in ms
 */
export async function delayDelete(messages: Message[], time: number = 10000) {
    setTimeout(async () => {
        for (const m of messages) {
            await m.delete()
        }
    }, time)
}