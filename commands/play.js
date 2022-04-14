const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, getVoiceConnection, VoiceConnectionStatus, AudioPlayer, AudioResource } = require('@discordjs/voice');
const voice = require('@discordjs/voice');
const { embedCreator } = require('../tools/embeds.js');
const ytdl = require('ytdl-core');

const cooldownEmbed = embedCreator("ctd", { color: '#F04A47', title: 'You are under cooldown!', description: 'Default cooldown time for this command is 6 seconds.' });

const cooldown = new Set();
const cooldownTime = 6000;

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

      const executor = interaction.member;
      const url = interaction.options.getString('link');
      var isYoutubeUrl = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/.test(url);
      if (!isYoutubeUrl) { return; };
      const stream = ytdl(url, { filter: 'audioonly' });
      const channel = interaction.member.voice.channel;
      const player = voice.createAudioPlayer();
      const resource = voice.createAudioResource(stream);
      const connection = joinVoiceChannel({ channelId: interaction.member.voice.channelId, guildId: interaction.member.guild.id, adapterCreator: interaction.member.guild.voiceAdapterCreator }); 
      const successEmbed = embedCreator("ctdt", { color: '#42B983', title: 'Joined VC & playing audio', description: `<:success:962658626999291904> Bot has successfully connected to VC and is now playing audio.\n\n**Given URL**:\n>>>${url}`, thumbnail: 'https://images-ext-1.discordapp.net/external/Y9ec_ju_jMFXEYbE-Ie5kPp5R5im0556dCBV7EPvn8M/https/www.youtube.com/img/desktop/yt_1200.png?width=458&height=458',  })

      await interaction.reply({ embeds: [successEmbed] });

      player.play(resource);
      connection.subscribe(player);

      player.on(voice.AudioPlayerStatus.Idle, () => {
        connection.destroy();
      });

    	cooldown.add(interaction.user.id);
        	setTimeout(() => {
          	// rm cooldown after it has passed
          	cooldown.delete(interaction.user.id);
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
