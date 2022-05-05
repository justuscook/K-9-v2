import { SlashCommandBuilder, SlashCommandChannelOption, SlashCommandStringOption } from '@discordjs/builders'
import { ChannelType } from 'discord-api-types/v10';
import { CommandInteraction, GuildChannel, GuildTextBasedChannel, Interaction } from 'discord.js'

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
export const name = 'speak';
export const execute = async (interaction: CommandInteraction) => {
    await interaction.deferReply();
    const text = interaction.options.getString('text');
    const channel = interaction.options.getChannel('channel') as GuildTextBasedChannel;
    if (text) {
        try {
            await channel.send(text)
        }
        catch (e){
            if(e.code === 50001){
                await interaction.followUp(`I can\'t send a message to **${channel.name}**, I don't have permisions there.`)
            }
            console.log(e)
            return;
        }
    }
    else {
        await channel.send('You shouldn\'t get this error, it\' Discords fault not mine!')
        return;
    }
    await interaction.followUp('Message sent master!')
    return;
}
export const usage: string = '/speak channel:lobby text: Hello'

