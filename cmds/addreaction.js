const { SlashCommandBuilder } = require('discord.js');
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('addreaction')
		.setDescription('Replies with Pong!')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message ID to watch for reactions')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('channel')
                .setDescription("The message's channel ID")
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reaction')
                .setDescription('The reaction name to watch for')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('role')
                .setDescription('The role ID to give the user')
                .setRequired(true)),
	async execute(interaction, client) {
        const channel = client.channels.cache.get(interaction.options.getString('channel'));
        const msg = await channel.messages.fetch(interaction.options.getString('message'));
        const rxn = await msg.react(interaction.options.getString('reaction'));
        const role = await msg.guild.roles.cache.find(r => r.id == interaction.options.getString('role'));

        await AddToDb(channel, msg, rxn, role);

/*        await console.log("Channel: "+channel+
                            "\nMessage: "+msg+
                            "\nReaction: "+rxn+
                            "\nRole: "+role);
*/
        

        await interaction.reply({
            content: 'i have done the thing',
            fetchReply: true
        });
	},
};

async function AddToDb(channel, msg, rxn, role) {
    console.log("adding to database...");
    allReactions = await db.fetch(`allReactions`);
    if (!allReactions) {
        console.log("creating reactions object");
        allReactions = [
            {
                "channelID": channel,
                "messageList": [
                    {
                        "messageID": msg,
                        "reactionList": [
                            {
                                "reactionName": rxn,
                                "roleList": [role]
                            }
                        ]
                    }
                ]
            }
        ]
    }
    let reqChannel = allReactions.filter(ch => ch.channelID == channel);
    if (!reqChannel) {
        console.log("creating new channel object");
        allReactions.append(
            {
                "channelID": channel,
                "messageList": [
                    {
                        "messageID": msg,
                        "reactionList": [
                            {
                                "reactionName": rxn,
                                "roleList": [role]
                            }
                        ]
                    }
                ]
            }
        )
    } else {
        let reqMessage = reqChannel.messageList.filter(ch2 => ch2.messageID == msg);
        if (!reqMessage) {
            console.log("creating new message object");
            reqChannel.messageList.append(
                {
                    "messageID": msg,
                    "reactionList": [
                        {
                            "reactionName": rxn,
                            "roleList": [role]
                        }
                    ]
                }
            )
        } else {
            let reqReaction = reqMessage.reactionList.filter(ch3 => ch3.reactionName == rxn);
            if (!reqReaction) {
                console.log("creating new reaction object");
                reqMessage.reactionList.append(
                    {
                        "reactionName": rxn,
                        "roleList": [role]
                    }
                );
            } else {
                if (reqReaction.roleList.includes(role)) {
                    console.log("reaction role already found!");
                } else {
                    console.log("adding new role to reaction object");
                    reqReaction.roleList.append(role);
                }
            }
        }
    }
    await db.set(`allReactions`, allReactions);
}