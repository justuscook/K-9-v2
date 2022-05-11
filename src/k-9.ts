import { Client, Intents, Interaction, Message } from 'discord.js';
import { clientId, token, galifreyGuildID } from './config.json';
import fs from 'fs';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';


export interface ICommandInfo {
    name: string,
    execute: any,
    usage: string,
    data: any
}

const commands: ICommandInfo[] = [];

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

    const commandFiles = fs.readdirSync(__dirname + '/commands').filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(__dirname + `/commands/${file}`);
        commands.push(command);
    }
    const rest = new REST({ version: '9' }).setToken(token);

    (async () => {
        try {
            const commandRegistration: any [] = [];
            for(const c of commands){
                commandRegistration.push(c.data.toJSON())
            }
            const response = await rest.put(
                Routes.applicationGuildCommands(clientId, galifreyGuildID),
                { body: commandRegistration },
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
    if (!interaction.isCommand()) return;

    const command: ICommandInfo | undefined = commands.find(x => x.name === interaction.commandName);

    if (!command) return;
    else {
        const commandSuccess: Promise<boolean> = await command.execute(interaction);
    }
console.log('K-9 Online!')
})

