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

// discord.js modules
const {SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection, VoiceConnectionStatus, AudioPlayer, AudioResource } = require('@discordjs/voice');
const voice = require('@discordjs/voice');

// custom modules
const { embedConstructor } = require('../lib/embeds.js');
const { log } = require('../lib/logging.js');
const invidious = require('../lib/invidious.js');

// data
const { debug } = require('../config.json');

// set cooldown
const cooldown = new Set();
const cooldownTime = 6000;
const cooldownEmbed = embedConstructor("cooldown", { cooldown: '6 seconds' });

module.exports = {
  data: new SlashCommandBuilder()
  .setName('play')
  .setDescription('Play audio to VC from specified search query')
  .addStringOption((option) => option.setName('query').setDescription('Search query').setRequired(true)),
  async execute(interaction) {
      // cooldown management
      if (cooldown.has(interaction.user.id)) {
      await interaction.reply({ embeds: [cooldownEmbed] });
      } else {

      // constants
      const executor = { obj: interaction.member, tag: interaction.user.tag, id: interaction.user.id }
      const query = interaction.options.getString('query')
      const channel = executor.obj.voice.channel
      let connection

      if (debug) log('genLog', { event: 'Commands > Play', content: `Initialized`, extra: [`${executor.tag}`] })

      if (channel) {
        connection = joinVoiceChannel({ 
          channelId: executor.obj.voice.channelId,
          guildId: executor.obj.guild.id,
          adapterCreator: executor.obj.guild.voiceAdapterCreator
        })
      } else {
        if (debug) log('genWarn', { event: 'Commands > Play', content: 'Failed.', cause: 'Executor is not in a voice channel.', extra: [`${executor.tag}`] })
        let embed = embedConstructor('playFailed', { reason: 'You are not in a voice channel!', query: query })
        interaction.reply({ embeds: [embed] })
        log('genLog', { event: 'Commands > Play', content: `Done${debug ? '' : ' with suppressed warnings'}.` })
        return
      }

      // defer
      let patient = embedConstructor('playAwait', {})
      await interaction.reply({ embeds: [patient] })

      let searchResults
      try {
         searchResults = await invidious.search(query, {type: 'video'})
      } catch (e) {
        if (debug) log('genWarn', { event: 'Commands > Play', content: 'Failed.', cause: 'Search failure!', extra: [`${query}`,`${executor.tag}`] })
        let embed = embedConstructor('playFailed', { reason: e.message, query: query })
        interaction.editReply({ embeds: [embed] })
        log('genLog', { event: 'Commands > Play', content: `Done${debug ? '' : ' with suppressed warnings'}.` })
        return
      }

      let buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setLabel('1').setCustomId('0').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setLabel('2').setCustomId('1').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setLabel('3').setCustomId('2').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setLabel('4').setCustomId('3').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setLabel('5').setCustomId('4').setStyle(ButtonStyle.Secondary)
      )

      if (!searchResults.length == 5) {
        for (var i = 4; i > (searchResults.length - 1); i--) {
          buttons.components[i].disabled = true
        }
      }

      let embed = embedConstructor('playSelection', { results: searchResults })
      if (debug) log('genWarn', { event: 'Commands > Play', content: 'Embed spawned', extra: [`${query}`,`${executor.tag}`] })
      await interaction.editReply({ embeds: [embed], components: [buttons] })
      let selected
      let link

      // collector
      const filter = i => i.customId === '0' || i.customId === '1' || i.customId === '2' || i.customId === '3' || i.customId === '4'
      const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 })
      if (debug) log('genLog', { event: 'Commands > Play', content: 'Component collector spawned', extra: [`${executor.tag}`] })

      collector.on('collect', async i => {
        if (i.user.id === executor.id) {
          await i.deferUpdate();
          await i.editReply({ embeds: [patient], components: [] });
          selected = await invidious.getVideo(searchResults[i.customId].metadata.id)
          link = selected.video.adaptive.find(item => item.itag === '140').url
          if (debug) log('genWarn', { event: 'Commands > Play', content: 'Executor selected a video', extra: [`${searchResults[i.customId].metadata.title} by ${searchResults[i.customId].author.name}`,`${executor.tag}`] })
          let selectedEmbed = embedConstructor('playSelected', { title: searchResults[i.customId].metadata.title, name: searchResults[i.customId].author.name });
          await i.editReply({ embeds: [selectedEmbed], components: [] })

          if (debug) log('genLog', { event: 'Commands > Play', content: 'Component collector killed' })
          collector.stop()
        } else {
          if (debug) log('genWarn', { event: 'Commands > Ban', content: `Interaction owner mismatch`, extra: [`Expected: ${executor.tag}`, `Got: ${i.user.tag}`] })
          let notForUserEmbed = embedConstructor('notForUser', {})
          await i.reply({ embeds: [notForUserEmbed], ephemeral: true })
        }
      })

      await collector.on('end', collected => {
        if (selected) {
          let player = voice.createAudioPlayer()
          let successEmbed = embedConstructor('playSuccess', { title: selected.metadata.title, name: selected.author.name })
          let resource = voice.createAudioResource(link)
          connection.subscribe(player)
          player.play(resource)
          interaction.followUp({ embeds: [successEmbed] })
          log('genLog', { event: 'Commands > Play', content: 'Done.', extra: [`${selected.metadata.title} by ${selected.author.name}`,`${executor.tag}`] })

          player.on(voice.AudioPlayerStatus.Idle, () => {
            let timeoutEmbed = embedConstructor('playTimeout')
            interaction.channel.send({ embeds: [timeoutEmbed] })
            connection.destroy()
            log('genLog', { event: 'Commands > Play', content: 'Connection destroyed.', extra: [`${executor.tag}`] })
          })
        }
      })

      // cooldown management
    	cooldown.add(executor.id)
      setTimeout(() => { cooldown.delete(executor.id); }, cooldownTime)

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