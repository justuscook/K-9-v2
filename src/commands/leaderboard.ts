import { SlashCommandBuilder, SlashCommandChannelOption, SlashCommandStringOption, SlashCommandSubcommandBuilder, SlashCommandSubcommandsOnlyBuilder } from '@discordjs/builders'
import { ChannelType } from 'discord-api-types/v10';
import { CommandInteraction, GuildChannel, GuildTextBasedChannel, Interaction, Message, MessageEmbed } from 'discord.js'
//Command setup
//most fo the command is in k-9.ts/js, taking place when sheet edits are made
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
//command name for help command
export const name = 'leaderboard';
/**
 * Leaderboard command, proof of concept atm
 * @param interaction THe interaction data
 */
export const execute = async (interaction: CommandInteraction) => {
    //defer so you can take more tha 3 seconds
    await interaction.deferReply();
    try {
        //Create embed to send
        const embed: MessageEmbed = new MessageEmbed()
            .setDescription(`Once the Message ID loads below, copy and paste that to the google sheets doc!`)
            .setTitle(interaction.options.getString('title'));
        //send the message
        const message: Message = await interaction.followUp({ embeds: [embed] }) as Message;
        //then update the message footer with message id, this is needed in google sheets
        embed.footer = { text: `Message ID: ${message.id}` }
        await message.edit({ embeds: [embed] });
    }
    catch (error) {
        //catch errors...
    }
}
export const usage: string = '/leaderboard start'