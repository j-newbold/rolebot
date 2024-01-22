const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { QuickDB } = require("quick.db");
const { ownerId } = require("../config.json");
const db = new QuickDB();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('resetdb')
		.setDescription('Resets database')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction, client) {
        if (interaction.user.id != ownerId) {
            console.log("Resetdb command executed without permission!");
            return;
        }
        await db.set(`allReactions`, []);
        console.log("resetting all reactions");
        await interaction.editReply({
            content: "job's done",
            fetchReply: true
        });
        await sleep(2000);
        await interaction.deleteReply();
    }
}