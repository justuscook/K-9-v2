import { Client, GuildTextBasedChannel, Intents, Interaction, Message, TextChannel } from 'discord.js';
import { clientId, token, galifreyGuildID } from './config.json';
import fs from 'fs';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import express, { Response, Request } from 'express';
import cors from 'cors';
import axois from 'axios'
import { getAuthToken, getSpreadSheetValues, ILeaderBoardData, ISheetData, ISpreadSheetValues, leaderbaordSheetId, mapValuesFromValues } from './utils/sheets';


export interface ICommandInfo {
    name: string,
    execute: any,
    usage: string,
    data: any
}

const app = express();
app.use(cors());
app.use(express.json());
app.listen(9002, () => {
    console.log('Listening on port 9002!')
})

app.post('/leaderboard', async (req: Request, res: Response) => {
    const reqData: ISheetData = req.body;
    console.log(reqData);
    res.status(200).send('Data received from google sheets!');
    const data: ISpreadSheetValues = await getSpreadSheetValues({
        sheetNameOrRange: `${reqData.sheetName}!R${1}C${1}:R${12}C${5}`,
        auth: await getAuthToken(),
        spreadsheetId: leaderbaordSheetId
    });
    const messageData = mapValuesFromValues(data);
    const channel = (await (await client.guilds.fetch('514616202249895936')).channels.fetch('620344940852936714') as GuildTextBasedChannel);
    console.log(messageData)
    const leaderboardMessage = await channel.messages.fetch(messageData.MessageId);
    let embed = leaderboardMessage.embeds[0];
    embed.setDescription(messageData.data.join('\n'));
    leaderboardMessage.edit({embeds: [embed]})

    
});

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
            const commandRegistration: any[] = [];
            for (const c of commands) {
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


