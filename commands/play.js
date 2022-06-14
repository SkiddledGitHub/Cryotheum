/**
 *
 * Copyright 2022 SkiddledGitHub (Discord: Skiddled#0802)
 *
 * This file is part of Cryotheum.
 * Cryotheum is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * Cryotheum is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; 
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with the Cryotheum source code. 
 * If not, see <https://www.gnu.org/licenses/>.
 *
 */

// modules
const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, getVoiceConnection, VoiceConnectionStatus, AudioPlayer, AudioResource } = require('@discordjs/voice');
const voice = require('@discordjs/voice');
const { debug } = require('../config.json');
const { embedConstructor, log } = require('../lib/cryoLib.js');
const ytdl = require('ytdl-core');


// set cooldown
const cooldown = new Set();
const cooldownTime = 6000;
const cooldownEmbed = embedConstructor("cooldown", { cooldown: '6 seconds' });

module.exports = {
  data: new SlashCommandBuilder()
  .setName('play')
  .setDescription('Play audio to VC from specified video link')
  .addStringOption((option) => option.setName('link').setDescription('Link of the video to play audio').setRequired(true)),
  async execute(interaction) {
      // cooldown management
      if (cooldown.has(interaction.user.id)) {
      await interaction.reply({ embeds: [cooldownEmbed] });
      } else {

      // constants
      const executor = interaction.member;
      const executorTag = executor.user.tag;
      const executorID = executor.user.id;
      const url = interaction.options.getString('link');
      const channel = executor.voice.channel;

      if (debug) { log('genLog', { event: 'Commands > Play', content: `Command initialized by ${executorTag}` }); };

      // check if url provided is a youtube url, if not then reply & return
      var isYoutubeUrl = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/.test(url);
      if (!isYoutubeUrl) { 
        const embed = embedConstructor('playFailed', { url: `${url}`, reason: 'Link provided is not a YouTube video link.' }); 
        async function failed() { await interaction.reply({ embeds: [embed] }); }; failed(); 
        if (debug) { log('cmdErr', { event: 'Play', content: `Link provided is not a YouTube video link`, extra: `Link: ${url}` }); };
        return; 
      };

      // if executor is not in channel, pull error
      if (channel == null) { 
        const embed = embedConstructor("playFailed", { url: `${url}`, reason: 'You are not in a voice channel!' }); 
        async function failed() { await interaction.reply({ embeds: [embed] }); }; failed();
        if (debug) { log('cmdErr', { event: 'Play', content: `User (${executorTag}) is not in a voice channel` }); };
        return; 
      };

      // important constants
      const stream = ytdl(url, { filter: 'audioonly', dlChunkSize: 0 });
      if (debug) { log('genLog', { event: 'Commands > Play', content: `Stream initialized` }); };
      const player = voice.createAudioPlayer();
      if (debug) { log('genLog', { event: 'Commands > Play', content: `Player initialized` }); };
      const resource = voice.createAudioResource(stream);
      if (debug) { log('genLog', { event: 'Commands > Play', content: `Resource initialized` }); };
      if (debug) { log('genLog', { event: 'Commands > Play', content: `Attempting to join voice channel` }); };
      try {
        const connection = joinVoiceChannel({ channelId: interaction.member.voice.channelId, guildId: interaction.member.guild.id, adapterCreator: interaction.member.guild.voiceAdapterCreator });
      } catch (error) {
        if (debug) { log('runtimeErr', { errName: error.name, event: 'Play', content: `Cannot join voice channel`, cause: error.message }); };
      }
      if (debug) { log('genLog', { event: 'Commands > Play', content: `Joined voice channel successfully` }); };

      // use player to play resource then subscribe connection handler to it
      player.play(resource); 
      if (debug) { log('genLog', { event: 'Commands > Play', content: `Playing resource using player` }); };
      connection.subscribe(player);
      if (debug) { log('genLog', { event: 'Commands > Play', content: `Subscribed player to voice connection` }); };

      // on success
      const successEmbed = embedConstructor('playSuccess', { url: `${url}` });
      if (debug) { log('genLog', { event: 'Commands > Play', content: `Sending success embed` }); };
      await interaction.reply({ embeds: [successEmbed] });
      if (debug) { log('genLog', { event: 'Commands > Play', content: `${executorTag} is playing audio of a video`, extra: `Link: ${url}` }); };
      // if player inactive, destroy connection
      player.on(voice.AudioPlayerStatus.Idle, () => {
        if (debug) { log('genLog', { event: 'Commands > Play', content: `Player idling, destroying connection...` }); };
        connection.destroy();
        if (debug) { log('genLog', { event: 'Commands > Play', content: `Connection destroyed.` }); };
      });

      // cooldown management
    	cooldown.add(executorID);
      setTimeout(() => { cooldown.delete(executorID); }, cooldownTime);

      	}
    }
}