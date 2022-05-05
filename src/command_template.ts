import { SlashCommandBuilder, SlashCommandChannelOption, SlashCommandStringOption } from '@discordjs/builders'
import { ChannelType } from 'discord-api-types/v10';
import { CommandInteraction, GuildChannel, GuildTextBasedChannel, Interaction } from 'discord.js'

export const data: SlashCommandBuilder = new SlashCommandBuilder()
    .setName('')
    .setDescription('')
    .setDefaultPermission(true)
export const name = 'speak';
export const execute = async (interaction: CommandInteraction) => {
    await interaction.deferReply();
}
export const usage: string = ''