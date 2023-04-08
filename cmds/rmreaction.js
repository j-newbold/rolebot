const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rmreaction')
		.setDescription('Removes reaction role listener')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message ID to remove the reaction from')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('channel')
                .setDescription("The message's channel ID")
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reaction')
                .setDescription('The reaction name to remove')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction, client) {

        try {

            const channel = client.channels.cache.get(interaction.options.getString('channel'));
            const msg = await channel.messages.fetch(interaction.options.getString('message'));
            const rxn = await interaction.options.getString('reaction');

            console.log("removing from database...");
            let allReactions = await db.get(`allReactions`);

            let ans = allReactions.findIndex(el => el.channelID == channel);
            if (ans > -1) {
                let ans2 = allReactions[ans].messageList.findIndex(el => el.messageID == msg);
                if (ans2 > -1) {
                    let ans3 = allReactions[ans].messageList[ans2].reactionList.findIndex(el => el.reactionID == rxn);
                    if (ans3 > -1) {
                        allReactions[ans].messageList[ans2].reactionList.splice(ans3, 1);
                        if (allReactions[ans].messageList[ans2].reactionList.length == 0) {
                            console.log('splicing messagelist');
                            allReactions[ans].messageList.splice(ans2, 1);
                            if (allReactions[ans].messageList.length == 0) {
                                console.log('splicing allreactions');
                                allReactions.splice(ans, 1);
                            }       // could simplify by adding "else?"
                        }
                        const regex = rxn.replace(/^<a?:\w+:(\d+)>$/, '$1');
                        console.log(regex);
                        await msg.reactions.cache.get(regex).remove()
                            .catch(error => console.error('Failed to remove reactions:', error));
                        await db.set(`allReactions`, allReactions);
                    }
                }
            }

        } catch(err) {
            console.log("ERROR: "+err);
        }

        await interaction.editReply("job's done");
        await sleep(2000);
        await deleteReply();
	},
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}