const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, Partials, Intents } = require('discord.js');
const { token, clientId } = require('./config.json');
const { QuickDB } = require("quick.db");
const db = new QuickDB();

const {REST} = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { Player } = require("discord-player");

const client = new Client({
	intents: [32767,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates],
	partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'cmds');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

client.player = new Player(client, {
    ytdlOptions: {
        quality: "highestaudio",
        highWaterMark: 1 << 25
    }
});

client.player.extractors.loadDefault();

/* client.on("ready", () => {
    const guild_ids = client.guilds.cache.map(guild => guild.id);

    const rest = new REST({version: "9"}).setToken(token);
    for (const guildId of guild_ids)
    {
        rest.put(Routes.applicationGuildCommands(clientId, guildId), {
            body:commands
        })
        .fetchInvite(() => console.log(`Added commands to ${guildId}`))
        .catch(console.error);
    }
}) */

client.on(Events.InteractionCreate, async interaction => {
	await interaction.deferReply();
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction, client);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.on(Events.MessageReactionAdd, async (reaction, user) => {
	if (reaction.partial) {
		try {
			await reaction.fetch();
		} catch (error) {
			console.error('Something went wrong when fetching the message:', error);
			return;
		}
	}

    let allReactions = await db.get(`allReactions`);

	let tempVar = allReactions.find(el => el.channelID == reaction.message.channel.id);
	if (tempVar) {
		let tempVar2 = tempVar.messageList.find(el2 => el2.messageID == reaction.message.id);
		if (tempVar2) {
			let tempStr = "<:"+reaction.emoji.name+":"+reaction.emoji.id+">";
			tempVar3 = tempVar2.reactionList.find(el3 => el3.reactionID == tempStr || el3.reactionID == reaction.emoji.name);
			if (tempVar3) {
				const gm = reaction.message.guild.members.cache.get(user.id);
				gm.roles.add(tempVar3.role);
			}
		}
	}
});

client.on(Events.MessageReactionRemove, async (reaction, user) => {
	if (reaction.partial) {
		try {
			await reaction.fetch();
		} catch (error) {
			console.error('Something went wrong when fetching the message:', error);
			return;
		}
	}

    let allReactions = await db.get(`allReactions`);

	let tempVar = allReactions.find(el => el.channelID == reaction.message.channel.id);
	if (tempVar) {
		let tempVar2 = tempVar.messageList.find(el2 => el2.messageID == reaction.message.id);
		if (tempVar2) {
			let tempStr = "<:"+reaction.emoji.name+":"+reaction.emoji.id+">";
			tempVar3 = tempVar2.reactionList.find(el3 => el3.reactionID == tempStr || el3.reactionID == reaction.emoji.name);
			if (tempVar3) {
				const gm = reaction.message.guild.members.cache.get(user.id);
				gm.roles.remove(tempVar3.role);
			}
		}
	}
});

client.login(token);