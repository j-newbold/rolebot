const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { QueryType } = require("discord-player");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Plays a song")
        .addSubcommand(subcommand => {
            return subcommand
                .setName("search")
                .setDescription("Searches for a song")
                .addStringOption(option => {
                    return option.setName("searchterms")
                        .setDescription("search keywords")
                        .setRequired(true);
                })
        })
        .addSubcommand(subcommand => {
            return subcommand
                .setName("playlist")
                .setDescription("Plays playlist from youtube")
                .addStringOption(option => {
                    return option.setName("url")
                        .setDescription("playlist url")
                        .setRequired(true);
                })
        })
        .addSubcommand(subcommand => {
            return subcommand
                .setName("song")
                .setDescription("Plays song from youtube")
                .addStringOption(option => {
                    return option.setName("url")
                        .setDescription("url of the song")
                        .setRequired(true);
                })
        }),
    async execute (interaction, client) {
        try {
            if (!interaction.member.voice.channel)
            {
                await interaction.editReply("You must be in a voice channel to use this command");
                return;
            }

            const queue = await client.player.nodes.create(interaction.guild);

            let embed = new EmbedBuilder();
            if(interaction.options.getSubcommand() === "song")
            {
                let url = interaction.options.getString("url");

                const result = await client.player.search(url, {
                    requestedBy: interaction.user,
                    searchEngine: QueryType.YOUTUBE_VIDEO,
                });
                

                if (result.tracks.length === 0)
                {
                    await interaction.editReply("No results found");
                    return;
                }

                const song = result.tracks[0];
                await queue.addTrack(song);

                embed
                    .setDescription(`Added **[${song.title}](${song.url})** to the queue`)
                    .setThumbnail(song.thumbnail)
                    .setFooter({text: `Duration: ${song.duration}`});
            }
            else if(interaction.options.getSubcommand() === "playlist")
            {
                let url = interaction.options.getString("url");

                const result = await client.player.search(url, {
                    requestedBy: interaction.user,
                    searchEngine: QueryType.YOUTUBE_PLAYLIST,
                });

                if (result.tracks.length === 0)
                {
                    await interaction.editReply("No playlist found");
                    return;
                }

                const playlist = result.playlist;
                await queue.addTracks(playlist);

                embed
                    .setDescription(`Added **[${playlist.title}](${playlist.url})** to the queue`)
                    .setThumbnail(playlist.thumbnail)
                    .setFooter({text: `Duration: ${playlist.duration}`});
            }
            else if(interaction.options.getSubcommand() === "search")
            {
                let url = interaction.options.getString("searchterms");

                const result = await client.player.search(url, {
                    requestedBy: interaction.user,
                    searchEngine: QueryType.AUTO,
                });

                if (result.tracks.length === 0)
                {
                    await interaction.editReply("No results found");
                    return;
                }

                const song = result.tracks[0];
                await queue.addTrack(song);

                embed
                    .setDescription(`Added **[${song.title}](${song.url})** to the queue`)
                    .setThumbnail(song.thumbnail)
                    .setFooter({text: `Duration: ${song.duration}`});
            }

            if (!queue.playing) await queue.play();
            await interaction.editReply({
                embeds: [embed]
            })

        } catch(err) {
            console.log(err);
            await interaction.editReply("Error");
        }
    }
}