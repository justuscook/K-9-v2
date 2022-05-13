import { SlashCommandBuilder, SlashCommandChannelOption, SlashCommandStringOption, SlashCommandSubcommandBuilder, SlashCommandSubcommandsOnlyBuilder } from '@discordjs/builders'
import { ChannelType } from 'discord-api-types/v10';
import { CommandInteraction, GuildChannel, GuildTextBasedChannel, Interaction, Message, MessageEmbed } from 'discord.js'

export const data: SlashCommandSubcommandsOnlyBuilder = new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Start a leader board, the command will need a Title for the leaderbaord.')
    .setDefaultPermission(true)
    .addSubcommand(new SlashCommandSubcommandBuilder()
        .setName('start')
        .setDescription('Add to the latest clan quest tracker message.')
        .addStringOption(new SlashCommandStringOption()
            .setName('title')
            .setDescription('Your clan quest info.')
            .setRequired(true)
        ));

export const name = 'leaderboard';
export const execute = async (interaction: CommandInteraction) => {
    await interaction.deferReply();
    try {
        const embed: MessageEmbed = new MessageEmbed()
            .setDescription(`Once the Message ID loads below, copy and paste that to the google sheets doc!`)
            .setTitle(interaction.options.getString('title'));
        const message: Message = await interaction.followUp({ embeds: [embed] }) as Message;
        embed.footer = { text: `Message ID: ${message.id}` }
        await message.edit({ embeds: [embed] });
    }
    catch (error) {

    }
}
export const usage: string = ''