/**
 * @license
 * @copyright Copyright 2022 SkiddledGitHub
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
const { MessageActionRow, MessageButton } = require('discord.js');
const { debug } = require('../config.json');
const { embedConstructor } = require('../lib/embeds.js');
const { log } = require('../lib/logging.js');
const invidious = require('../lib/invidious.js');


// set cooldown
const cooldown = new Set();
const cooldownTime = 6000;
const cooldownEmbed = embedConstructor("cooldown", { cooldown: '6 seconds' });

module.exports = {
  data: new SlashCommandBuilder()
  .setName('play')
  .setDescription('Play audio to VC from specified YouTube video link')
  .addStringOption((option) => option.setName('link').setDescription('Link of the video to play audio from').setRequired(true)),
  async execute(interaction) {
      // cooldown management
      if (cooldown.has(interaction.user.id)) {
      await interaction.reply({ embeds: [cooldownEmbed] });
      } else {

      // constants
      const executor = { obj: interaction.member, tag: interaction.user.tag, id: interaction.user.id };
      const query = interaction.options.getString('link');
      const channel = executor.obj.voice.channel;
      let connection;

      if (debug) { log('genLog', { event: 'Commands > Play', content: `Command initialized by ${executor.tag}` }); };

      if (channel) {
        connection = joinVoiceChannel({ 
          channelId: executor.obj.voice.channelId,
          guildId: executor.obj.guild.id,
          adapterCreator: executor.obj.guild.voiceAdapterCreator
        });
      } else {
        interaction.reply('ur not in a channel lmao');
        return;
      }

      // defer
      await interaction.deferReply();

      let searchResults;
      try {
         searchResults = await invidious.search(query, {type: 'video'});
      } catch (e) {
        let embed = embedConstructor('playFailed', { reason: e.message, query: query });
        interaction.editReply({ embeds: [embed] });
        return;
      }

      let buttons = new MessageActionRow().addComponents(
        new MessageButton().setLabel('1').setCustomId('0').setStyle('SECONDARY'),
        new MessageButton().setLabel('2').setCustomId('1').setStyle('SECONDARY'),
        new MessageButton().setLabel('3').setCustomId('2').setStyle('SECONDARY'),
        new MessageButton().setLabel('4').setCustomId('3').setStyle('SECONDARY'),
        new MessageButton().setLabel('5').setCustomId('4').setStyle('SECONDARY')
      );

      if (!searchResults.length == 5) {
        for (var i = 4; i > (searchResults.length - 1); i--) {
          buttons.components[i].disabled = true;
        }
      }

      let embed = embedConstructor('playSelection', { results: searchResults });
      await interaction.editReply({ embeds: [embed], components: [buttons] });
      let selected;
      let link;

      // collector
      const filter = i => i.customId === '0' || i.customId === '1' || i.customId === '2' || i.customId === '3' || i.customId === '4';
      const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

      collector.on('collect', async i => {
        if (i.user.id === executor.id) {
          await i.deferUpdate();
          selected = await invidious.getVideo(searchResults[i.customId].metadata.id);
          link = selected.video.adaptive.find(item => item.itag === '140').url;
          let selectedEmbed = embedConstructor('playSelected', { title: searchResults[i.customId].metadata.title, name: searchResults[i.customId].author.name });
          await i.editReply({ embeds: [selectedEmbed], components: [] });
          collector.stop();
        } else {
          let notForUserEmbed = embedConstructor('notForUser');
          await i.reply({ embeds: [embed] });
        }
      });

      await collector.on('end', collected => {
        if (selected) {
          let player = voice.createAudioPlayer();
          let successEmbed = embedConstructor('playSuccess', { title: selected.metadata.title, name: selected.author.name }); 
          let resource = voice.createAudioResource(link);
          connection.subscribe(player);
          player.play(resource);
          interaction.followUp({ embeds: [successEmbed] });

          player.on(voice.AudioPlayerStatus.Idle, () => {
            let timeoutEmbed = embedConstructor('playTimeout');
            interaction.channel.send({ embeds: [timeoutEmbed] });
            connection.destroy();
          });
        }
      })

      /*
        player.play(resource);
        connection.subscribe(player);
        player.on(voice.AudioPlayerStatus.Idle, () => {
          if (debug) { log('genLog', { event: 'Commands > Play', content: `Player idling, destroying connection...` }); };
          connection.destroy();
          if (debug) { log('genLog', { event: 'Commands > Play', content: `Connection destroyed.` }); };
        });
      */

      // cooldown management
    	cooldown.add(executor.id);
      setTimeout(() => { cooldown.delete(executor.id); }, cooldownTime);

      	}
    },
  documentation: {
    name: 'play',
    category: 'Media',
    description: 'Play audio to VC from specified YouTube video link.',
    syntax: '/play link:[String]',
    cooldown: `${Math.round(cooldownTime / 1000)} seconds`,
    arguments: [
      { name: 'link', targetValue: 'String', description: 'The link of the video to play audio from' }
    ]
  }
}