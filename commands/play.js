// modules
const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, getVoiceConnection, VoiceConnectionStatus, AudioPlayer, AudioResource } = require('@discordjs/voice');
const voice = require('@discordjs/voice');
const { ytCookies, ytIdentity, debug } = require('../config.json');
const { embedCreator } = require('../tools/embeds.js');
const ytdl = require('ytdl-core');


// set cooldown
const cooldown = new Set();
const cooldownTime = 6000;
const cooldownEmbed = embedCreator("cooldown", { cooldown: '6 seconds' });

module.exports = {
  data: new SlashCommandBuilder()
  .setName('play')
  .setDescription('Play audio to VC from specified video link')
  .addStringOption((option) => option.setName('link').setDescription('Link of the video to play audio').setRequired(true)),
  async execute(interaction) {
      try {
      if (cooldown.has(interaction.user.id)) {
      await interaction.reply({ 
          embeds: [cooldownEmbed], 
          ephemeral: true 
        });
      } else {

      // constants
      const executor = interaction.member;
      const executorTag = executor.user.tag;
      const executorID = executor.user.id;
      const url = interaction.options.getString('link');
      const channel = executor.voice.channel;

      // check if url provided is a youtube url, if not then reply & return
      var isYoutubeUrl = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/.test(url);
      if (!isYoutubeUrl) { const embed = embedCreator('playFailed', { url: `${url}`, reason: 'Link provided is not a YouTube video link.' }); async function failed() { await interaction.reply({ embeds: [embed] }); }; failed(); return; };

      // if executor is not in channel, pull error
      if (channel == null) { const embed = embedCreator("playFailed", { url: `${url}`, reason: 'You are not in a voice channel!' }); async function failed() { await interaction.reply({ embeds: [embed] }); }; failed(); return; };

      // important constants
      const stream = ytdl(url, { filter: 'audioonly', dlChunkSize: 0, requestOptions: {
        headers: {
          Cookie: ytCookies,
          'x-youtube-identity-token': ytIdentity,
          'x-youtube-client-version': '2.20220413.05.00',
          'x-youtube-client-name': '1',
        }
      }});
      const player = voice.createAudioPlayer();
      const resource = voice.createAudioResource(stream);
      const connection = joinVoiceChannel({ channelId: interaction.member.voice.channelId, guildId: interaction.member.guild.id, adapterCreator: interaction.member.guild.voiceAdapterCreator }); 

      // use player to play resource then subscribe connection handler to it
      player.play(resource); 
      connection.subscribe(player);

      // on success
      const successEmbed = embedCreator('playSuccess', { url: `${url}` });
      await interaction.reply({ embeds: [successEmbed] });
      if (debug) {
      console.log(` \x1b[1;32m=> \x1b[1;37m${executorTag} is playing audio of a video: \n\x1b[0m\x1b[35m  -> URL: \x1b[37m${url}`);
      };
      // if player inactive, destroy connection
      player.on(voice.AudioPlayerStatus.Idle, () => {
        connection.destroy();
      });

    	cooldown.add(executorID);
        	setTimeout(() => {
          	// rm cooldown after it has passed
          	cooldown.delete(executorID);
        	}, cooldownTime);
      	}
      } catch (error) {
        var errorEmbed = embedCreator("error", { error: `${error}` });
      	await interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
      	})
      	console.error(` \x1b[1;31m=> ERROR: \x1b[1;37m${error}`);
    	}
  	},
}