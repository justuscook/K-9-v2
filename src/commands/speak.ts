import { SlashCommandBuilder, SlashCommandChannelOption, SlashCommandStringOption } from '@discordjs/builders'
import { ChannelType } from 'discord-api-types/v10';
import { CommandInteraction, GuildChannel, GuildTextBasedChannel, Interaction } from 'discord.js'

/**
 * Slash command setup
 */
export const data: SlashCommandBuilder = new SlashCommandBuilder()
    .setName('speak')
    .addChannelOption(new SlashCommandChannelOption()
        .setName('channel')
        .setDescription('Choose the channel K-9 will speak.')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true))
    .addStringOption(new SlashCommandStringOption()
        .setName('text')
        .setDescription('What I should say.')
        .setRequired(true))
    .setDescription('Send a message as K-9 to a choosen channel.')
    .setDefaultPermission(true)

/**
 * Command name, needed for help command
 */
export const name = 'speak';
/**
 * Sends a message to the selected channel, unless the bot doesnt have access
 * @param interaction the interaction sent from the interaction handler
 * @returns Can add a boolen return for successful or failed command
 */
export const execute = async (interaction: CommandInteraction) => {
    //this line is standard, if the bot doesnt replay to the interaction in a certain amount of time the command will fail, this is fail safe the extends 
    await interaction.deferReply();
    //how to get the string option aboves value
    const text = interaction.options.getString('text');
    //Getting the option for the channel chosen, its  a list of channels generated by discord, not hard coded
    const channel = interaction.options.getChannel('channel') as GuildTextBasedChannel;
    //Send the message to the channel, if it fails code 50001, that means the bot cant send there    
    if (text) {
        try {
            await channel.send(text)
        }
        catch (e) {
            if (e.code === 50001) {
                await interaction.followUp(`I can\'t send a message to **${channel.name}**, I don't have permisions there.`)
            }
            console.log(e)
            return;
        }
    }
    //if text(input) is empty, which it shouldnt be because its a required, tell the user
    else {
        await channel.send('You shouldn\'t get this error, it\'s Discords fault not mine!')
        return;
    }
    //tell the user that it worked, also stops the bot thinking in channel
    await interaction.followUp('Message sent master!')
    return;
}
//help command text, how to invoke the command
export const usage: string = '/speak channel:lobby text: Hello'

