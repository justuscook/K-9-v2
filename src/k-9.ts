import { Client, Intents, Interaction } from 'discord.js';
import { clientId, token, galifreyGuildID } from './config.json';
import fs from 'fs'
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9'

export const client: Client = new Client({
    intents:
        [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.DIRECT_MESSAGES
        ],
    partials: [
        'CHANNEL'
    ]
});

async function deployCommands() {
    const commands = [];
    const commandFiles = fs.readdirSync(__dirname + '/commands').filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(__dirname + `/commands/${file}`);
        commands.push(command.data.toJSON());
    }
    const rest = new REST({ version: '9' }).setToken(token);

    (async () => {
        try {

            const response = await rest.put(
                Routes.applicationGuildCommands(clientId, galifreyGuildID),
                { body: commands },
            );
        }
        catch (error) {
            console.error(error);
        }
    })();
}

client.login(token);
 client.once('ready', async () => {
    await deployCommands();
 })

 client.on('interactionCreate', async (interaction: Interaction) => {
     
 })


