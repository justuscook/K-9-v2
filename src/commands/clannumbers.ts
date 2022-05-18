import { SlashCommandBuilder, SlashCommandChannelOption, SlashCommandStringOption, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder, SlashCommandSubcommandsOnlyBuilder } from '@discordjs/builders';
import { CommandInteraction, EmbedField, GuildChannel, GuildMember, GuildTextBasedChannel, Interaction, Message, MessageEmbed } from 'discord.js';
import { connectToCollection, connectToDB, IClanQuestMessage } from '../utils/database';
import { delayDelete } from '../utils/general';
//Clan quest set up
export const data: SlashCommandSubcommandsOnlyBuilder = new SlashCommandBuilder()
    .setName('clannumbers')
    .setDescription('Use this command to setup clan quest tracking!')
    .setDefaultPermission(true)
    .addSubcommand(new SlashCommandSubcommandBuilder()
        .setName('start')
        .setDescription('Create a new clan numbers tracker message.'))
    .addSubcommand(new SlashCommandSubcommandBuilder()
        .setName('add')
        .setDescription('Add to the latest clan numbers tracker message.')
        
        .addStringOption(new SlashCommandStringOption()
            .setName('input')
            .setDescription('Your clan numbers info.')
            .setRequired(true)
        ))
    .addSubcommand(new SlashCommandSubcommandBuilder()
        .setName('move')
        .setDescription('Move the clan quests leader board postion to the latest message.')
    );

//Name of command for help command
export const name = 'clannumbers';
export const execute = async (interaction: CommandInteraction) => {
    await interaction.deferReply();
    //figure out what sub command was used
    switch (interaction.options.getSubcommand()) {
        //start make a new clan quest message, and records the message id in the DB so we can find it and update it later
        //Only mods can do this, currently just making sure the user has a role with the word 'mod' in it...
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
            //send the message with an embed as the content, embeds are made out of certain pieces, some required.
            //also have several limitations
            //if you defer a reply, you need to use follow up for messages later
            const clanQuestMessage = await interaction.followUp({ embeds: [embed] }) as Message;
            const client = await connectToDB();
            const collection = await connectToCollection('clan-quests', client);
            //connect to the DB and update the clan quest messasge ID
            await collection.updateOne(
                { channelId: interaction.channelId },
                {
                    $set: {
                        clanQuestMessage: clanQuestMessage.id
                    }
                },
                { upsert: true },
                async (err: any, result: any) => {
                    //if the save to db works, react ☑, else X and log
                    if (!err) {

                        await clanQuestMessage.react('☑');
                    }
                    else {
                        console.log(err)

                        await clanQuestMessage.react('❌');
                    }
                    await client.close();
                });
            //make sure to disconnect form the server

            break;
        }
        case 'add': {
            //this will add or update the users info on the clan quest message
            const client = await connectToDB();
            const collection = await connectToCollection('clan-quests', client);
            //get the clan quest message
            const clanQuestMessageInfo: IClanQuestMessage = await collection.findOne<IClanQuestMessage>({ channelId: interaction.channelId });
            if (clanQuestMessageInfo) {
                const message = await interaction.channel.messages.fetch(clanQuestMessageInfo.clanQuestMessage)
                //get the current embed on the message
                const embed: MessageEmbed = message.embeds[0]
                let name;
                try {
                    name = (interaction.member as GuildMember).nickname;
                }
                catch {
                    name = interaction.member.user.username
                }
                //each user has a feild in the embed, if the embed has no fields, make that user the first one.
                if (embed.fields.length === 0) {
                    embed.addField(name, interaction.options.getString('input'), true)
                    await client.close();
                }
                //else look for the users nickname as the field title, if found update it
                else {
                    const updateField: EmbedField = embed.fields.find(x => x.name === name);
                    if (updateField) {
                        updateField.value = interaction.options.getString('input')
                    }
                    //if you dont find the nickname then they are probably new and add them
                    else {
                        embed.addField(name, interaction.options.getString('input'), true)
                    }
                    await client.close();
                }
                //send the updated embed back to the message
                await message.edit({ embeds: [embed] })
                //send a message so the user knows that they were added incase they dont see the message update
                const followUp = await interaction.followUp({ content: `${interaction.user} Your clan quest info has been updated!`, ephemeral: true }) as Message;
                //delete the followup after the default 10 seconds
                await delayDelete([followUp]);
                await client.close();
            }
            //if there is no clan quest message yet, ask the user to start one
            else {
                const followUp = await interaction.followUp(`${interaction.user} Please use '/clanquests start' to start a clan quests tracking message I can update first!`) as Message;
                await delayDelete([followUp]);
                await client.close();
            }
            await client.close();
            break;
        }
        //"move" the clan quest message to the most recent message in the channel
        case 'move': {
            const client = await connectToDB();
            const collection = await connectToCollection('clan-quests', client);
            //get the clan quest message id
            const clanQuestMessageInfo: IClanQuestMessage = await collection.findOne<IClanQuestMessage>({ channelId: interaction.channelId });
            if (clanQuestMessageInfo) {
                let newEmbed: MessageEmbed = new MessageEmbed();
                newEmbed = (await interaction.channel.messages.fetch(clanQuestMessageInfo.clanQuestMessage)).embeds[0];
                //make a copy of the message and resend it so its the latest
                const newMessage = await interaction.followUp({ embeds: [newEmbed] })
                //then up date the clan quest message id in DB
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
                            await client.close();
                        }
                    });
                await client.close();
            }
            else {
                //ask user to do start command if theres no clan quest yet
                await interaction.followUp(`Please use **/clanquests start first**`)
                await client.close();
            }
            await client.close();
            break;
        }
    }
}
export const usage: string = '/clanquests start\nclanquests add input:1/1/1';