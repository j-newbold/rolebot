const { SlashCommandBuilder } = require('discord.js');

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
        //console.log(client.channels.cache.get(interaction.options.getString('message')));
        const channel = client.channels.cache.get(interaction.options.getString('channel'));
        const msg = await channel.messages.fetch(interaction.options.getString('message'));
        const rxn = await msg.react(interaction.options.getString('reaction'));
        const role = await msg.guild.roles.cache.find(r => r.id == interaction.options.getString('role'));

        await console.log(role);

        await interaction.reply({
            content: 'i have done the thing',
            fetchReply: true
        });

        //const emoji = client.emojis.cache.get('1036071608835649567');

        //message.react(emoji);

 /*       const filter = (reaction, user) => {
            return true;
        };
        
        const collector = message.createReactionCollector({ filter, time: 15000 });
        
        message.awaitReactions({ filter, max: 4, time: 10000, errors: ['time'] })
        .then(collected => console.log(collected.size))
        .catch(collected => {
            console.log(`After a minute, only ${collected.size} out of 4 reacted.`);
        });*/
	},
};