import { Client } from "discord.js";

const MAXIMUM_MESSAGES_BETWEEN_OBAMA = 100;
var mesageCounter = 0;

function getProbability(messages: number) {
    return Math.min(1, (messages / MAXIMUM_MESSAGES_BETWEEN_OBAMA) ** 3);
}

export function setupObama(client: Client) {
    client.on('messageCreate', (message) => {
        if (Math.random() < getProbability(++mesageCounter)) {
            message.channel.send("https://m.youtube.com/watch?v=0aQwnxwnve0");
            mesageCounter = 0;
        }
    })
}
