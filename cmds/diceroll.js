const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('diceroll')
        .setDescription('Rolls a die')
        .addStringOption(option =>
            option.setName('sides')
                .setDescription('Number of sides the dice have')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('qty')
                .setDescription('How many dice to roll')
                .setRequired(false)),
    async execute(interaction, client) {
        try {
            var qty = 1;
            if (interaction.options.getString('qty') != null) {
                qty = parseInt(interaction.options.getString('qty'));
            }
            const sides = parseInt(interaction.options.getString('sides'));
            let retArr = [];
            let sum = 0;
            for (let i=0;i<qty;i++) {
                let newVal = Math.floor(Math.random()*sides)+1;
                retArr.push(newVal);
                sum += newVal;
            }
            await interaction.editReply(
                qty+'d'+sides+': '+sum+'\n('+retArr.toString()+')'
            );
        } catch(err) {
            console.log(err);
        }
    },
}