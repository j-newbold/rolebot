const { SlashCommandBuilder } = require('discord.js');
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('showdb')
		.setDescription('Prints all reactions to command line'),
	async execute(interaction, client) {
        let allReactions = await db.get(`allReactions`);
        console.log("printing all reactions");
        console.log(allReactions[0].messageList[0].reactionList);
        await interaction.reply({
            content: 'i have done the thing',
            fetchReply: true
        });
    }
}