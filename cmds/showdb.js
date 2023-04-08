const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { QuickDB } = require("quick.db");
const { ownerId } = require("../config.json");
const db = new QuickDB();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('showdb')
		.setDescription('Prints all reactions to command line')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction, client) {
        if (interaction.user.id != ownerId) {
            console.log("Showdb command executed without permission!");
            return;
        }
        let allReactions = await db.get(`allReactions`);
        console.log("printing all reactions");
        console.log(allReactions[0].messageList[0].reactionList);
        await interaction.reply({
            content: "job's done",
            fetchReply: true
        });
    }
}