const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('addreaction')
		.setDescription('Adds reaction role listener')
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
                .setRequired(true))
                .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction, client) {
        try {
            const channel = client.channels.cache.get(interaction.options.getString('channel'));
            const msg = await channel.messages.fetch(interaction.options.getString('message'));
            const rxn = await interaction.options.getString('reaction');
            await msg.react(rxn);
            const role = await msg.guild.roles.cache.find(r => r.id == interaction.options.getString('role'));
    
            await AddToDb(channel, msg, rxn, role);
        } catch(err) {
            console.log(err);
        }

        await interaction.reply("job's done");
        await sleep(2000);
        await interaction.deleteReply();
	},
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function AddToDb(channel, msg, rxn, role) {
    console.log("adding to database...");
    let allReactions = await db.get(`allReactions`);
    if (!allReactions || allReactions.length == 0) {
        allReactions = [
            {
                "channelID": channel.id,
                "messageList": [
                    {
                        "messageID": msg.id,
                        "reactionList": [
                            {
                                "reactionID": rxn,
                                "role": role.id
                            }
                        ]
                    }
                ]
            }
        ]
    } else {
        let reqChannel = allReactions.find(ch => ch.channelID == channel.id);
        if (!reqChannel) {
            allReactions.push(
                {
                    "channelID": channel.id,
                    "messageList": [
                        {
                            "messageID": msg.id,
                            "reactionList": [
                                {
                                    "reactionID": rxn,
                                    "role": role.id
                                }
                            ]
                        }
                    ]
                }
            )
        } else {
            let reqMessage = reqChannel.messageList.find(ch2 => ch2.messageID == msg.id);
            if (!reqMessage) {
                reqChannel.messageList.push(
                    {
                        "messageID": msg.id,
                        "reactionList": [
                            {
                                "reactionID": rxn,
                                "role": role.id
                            }
                        ]
                    }
                )
            } else {
                let reqReaction = reqMessage.reactionList.find(ch3 => ch3.reactionID == rxn);
                if (!reqReaction) {
                    reqMessage.reactionList.push(
                        {
                            "reactionID": rxn,
                            "role": role.id
                        }
                    );
                } else {
                    if (reqReaction.role == role.id) {
                    } else {
                        reqReaction.role = role.id;
                    }
                }
            }
        }
    }

    await db.set(`allReactions`, allReactions);
}