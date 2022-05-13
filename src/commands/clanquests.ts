import { SlashCommandBuilder, SlashCommandChannelOption, SlashCommandStringOption, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder, SlashCommandSubcommandsOnlyBuilder } from '@discordjs/builders';
import { CommandInteraction, EmbedField, GuildChannel, GuildMember, GuildTextBasedChannel, Interaction, Message, MessageEmbed } from 'discord.js';
import { connectToCollection, connectToDB, IClanQuestMessage } from '../utils/database';
import { delayDelete } from '../utils/general';

export const data: SlashCommandSubcommandsOnlyBuilder = new SlashCommandBuilder()
    .setName('clanquests')
    .setDescription('Use this command to setup clan quest tracking!')
    .setDefaultPermission(true)
    .addSubcommand(new SlashCommandSubcommandBuilder()
        .setName('start')
        .setDescription('Create a new clan quest tracker message.'))
    .addSubcommand(new SlashCommandSubcommandBuilder()
        .setName('add')
        .setDescription('Add to the latest clan quest tracker message.')
        .addStringOption(new SlashCommandStringOption()
            .setName('input')
            .setDescription('Your clan quest info.')
            .setRequired(true)
        ))
    .addSubcommand(new SlashCommandSubcommandBuilder()
        .setName('move')
        .setDescription('Move the clan quests leader board postion to the latest message.')
    );


export const name = 'clanquests';
export const execute = async (interaction: CommandInteraction) => {
    await interaction.deferReply();
    switch (interaction.options.getSubcommand()) {
        case 'start': {
            const user: GuildMember = await interaction.guild.members.fetch(interaction.user);
            const roles = user.roles.cache.filter(x => x.name.toLowerCase().includes('mod'));
            if (roles.size === 0) {
                const notMod = await interaction.followUp(`Only mods can use the /clanquests start command.`) as Message;
                await delayDelete([notMod]);
                return;
            }
            const embed = new MessageEmbed()
                .setDescription(`This is your clan quest track, it will update as you provide input!  Use \`/clanquests add input:x/y/z\` to add or update this tracker!`)
                .setFooter({
                    text: `Once you see the ☑ under this message it should be ready, its its an ❌ ping Orcinus! **x** is for Basic, **y** for Expert, and **z** for Elite quests.`
                })
            const clanQuestMessage = await interaction.followUp({ embeds: [embed] }) as Message;
            const client = await connectToDB();
            const collection = await connectToCollection('clan-quests', client);
            await collection.updateOne(
                { channelId: interaction.channelId },
                {
                    $set: {
                        clanQuestMessage: clanQuestMessage.id
                    }
                },
                { upsert: true },
                async (err: any, result: any) => {

                    if (!err) {

                        await client.close();
                        await clanQuestMessage.react('☑');
                    }
                    else {
                        console.log(err)
                        await client.close();
                        await clanQuestMessage.react('❌');
                    }

                });
            break;
        }
        case 'add': {
            const client = await connectToDB();
            const collection = await connectToCollection('clan-quests', client);
            const clanQuestMessageInfo: IClanQuestMessage = await collection.findOne<IClanQuestMessage>({ channelId: interaction.channelId });
            if (clanQuestMessageInfo) {
                const message = await interaction.channel.messages.fetch(clanQuestMessageInfo.clanQuestMessage)
                const embed: MessageEmbed = message.embeds[0]
                const nickname = (interaction.member as GuildMember).nickname;
                if (embed.fields.length === 0) {
                    embed.addField(nickname, interaction.options.getString('input'), true)
                }
                else {
                    const updateField: EmbedField = embed.fields.find(x => x.name === nickname);
                    if (updateField) {
                        updateField.value = interaction.options.getString('input')
                    }
                    else {
                        embed.addField(nickname, interaction.options.getString('input'), true)
                    }
                }
                await message.edit({ embeds: [embed] })
                const followUp = await interaction.followUp({ content: `${interaction.user} Your clan quest info has been updated!`, ephemeral: true }) as Message;
                await delayDelete([followUp])
            }
            else {
                const followUp = await interaction.followUp(`${interaction.user} Please use '/clanquests start' to start a clan quests tracking message I can update first!`) as Message;
                await delayDelete([followUp]);
            }
            break;
        }
        case 'move': {
            const client = await connectToDB();
            const collection = await connectToCollection('clan-quests', client);
            const clanQuestMessageInfo: IClanQuestMessage = await collection.findOne<IClanQuestMessage>({ channelId: interaction.channelId });
            if (clanQuestMessageInfo) {
                let newEmbed: MessageEmbed = new MessageEmbed();
                newEmbed = (await interaction.channel.messages.fetch(clanQuestMessageInfo.clanQuestMessage)).embeds[0];
                const newMessage = await interaction.followUp({ embeds: [newEmbed] })
                await collection.updateOne(
                    { channelId: interaction.channelId },
                    {
                        $set: {
                            clanQuestMessage: newMessage.id
                        }
                    },
                    { upsert: true },
                    async (err: any, result: any) => {
                        if (err) {
                            await interaction.channel.send(`Get Orcinus in here!  I dun goofed!`)
                        }
                    });
            }
            else {
                await interaction.followUp(`Please use **/clanquests start first**`)
            }
            break;
        }
    }
}
export const usage: string = '/clanquests start\nclanquests add input:1/1/1';