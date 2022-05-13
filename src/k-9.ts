import { Client, GuildTextBasedChannel, Intents, Interaction, Message, TextChannel } from 'discord.js';
import { clientId, token, galifreyGuildID } from './config.json';
import fs from 'fs';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import express, { Response, Request } from 'express';
import cors from 'cors';
import axois from 'axios'
import { getAuthToken, getSpreadSheetValues, ISheetData, ISpreadSheetValues, leaderbaordSheetId, mapValuesFromValues } from './utils/sheets';

//Info used to load commands into bot and register them to discrod, also has info for help command later
export interface ICommandInfo {
    name: string,
    execute: any,
    usage: string,
    data: any
}

//start express server for api
const app = express();
//user cors, think its needed for google apis
app.use(cors());
//use json body format
app.use(express.json());
//listen on port 9002 http
app.listen(9002, () => {
    console.log('Listening on port 9002!')
})

//listen for data at :9002/leaderboard
app.post('/leaderboard', async (req: Request, res: Response) => {
    //the data sent by the api when a cell is edited, in the google sheets Extensions, appScript
    const reqData: ISheetData = req.body;
    console.log(reqData);
    //Return that info was recieved successfully
    res.status(200).send('Data received from google sheets!');
    //get the values from the sheet, currently hard coded for testing
    const data: ISpreadSheetValues = await getSpreadSheetValues({
        sheetNameOrRange: `${reqData.sheetName}!R${1}C${1}:R${12}C${5}`,
        auth: await getAuthToken(),
        spreadsheetId: leaderbaordSheetId
    });
    //Get the data in a form to use
    const messageData = mapValuesFromValues(data);
    //get the discord channel update the leaderboard in, might need to send this info from google. Hardcoded to #champ-build-bot channel atm
    const channel = (await (await client.guilds.fetch('514616202249895936')).channels.fetch('620344940852936714') as GuildTextBasedChannel);
    console.log(messageData)
    //Get the leader board message by ID
    const leaderboardMessage = await channel.messages.fetch(messageData.MessageId);
    //Get value of cunnent embed
    let embed = leaderboardMessage.embeds[0];
    //Set the description of the embed to the values of the sheet
    embed.setDescription(messageData.data.join('\n'));
    //etit the message
    await leaderboardMessage.edit({ embeds: [embed] })
});

const commands: ICommandInfo[] = [];
//discord client settings needed to get the api responses we need
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


//register commands with discord
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
//Bog bot into discord
client.login(token);
//when successfull, update the commands
client.once('ready', async () => {
    await deployCommands();
})


//Interaction command handler
client.on('interactionCreate', async (interaction: Interaction) => {
    //if its not a command interaction ignore it, for now...
    if (!interaction.isCommand()) return;
    //Get the command name, and look for the command file
    const command: ICommandInfo | undefined = commands.find(x => x.name === interaction.commandName);
    //if the command isnt found, do nothing
    if (!command) return;
    //else execute the found command
    else {
        const commandSuccess: Promise<boolean> = await command.execute(interaction);
    }
    //Console output so you know bot connected
    console.log('K-9 Online!')
})


