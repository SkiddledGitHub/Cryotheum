// modules
const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, getVoiceConnection, VoiceConnectionStatus, AudioPlayer, AudioResource } = require('@discordjs/voice');
const voice = require('@discordjs/voice');
const { debug } = require('../config.json');
const { embedCreator } = require('../tools/embeds.js');
const ytdl = require('ytdl-core');
const { log } = require('../tools/loggingUtil.js');


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
      const stream = ytdl(url, { filter: 'audioonly', dlChunkSize: 0 });
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
      log('genLog', `${executorTag} is playing audio of a video: \n\x1b[0m\x1b[35m  -> URL: \x1b[37m${url}`);
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
  }
}