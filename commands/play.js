const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection, VoiceConnectionStatus, AudioPlayer, AudioResource } = require('@discordjs/voice');
const voice = require('@discordjs/voice');

const { embedConstructor } = require('../lib/embeds.js');
const { log } = require('../lib/logging.js');
// const invidious = require('../lib/invidious.js'); # The Invidious library has been deprecated due to poor performance.
const yt = require('../lib/yt.js');
const ytdl = require('ytdl-core');

const { debug } = require('../config.json');

const cooldown = new Set();
const cooldownTime = 6000;
const cooldownEmbed = embedConstructor("cooldown", { cooldown: '6 seconds' });

module.exports = {
  data: new SlashCommandBuilder()
  .setName('play')
  .setDescription('Play audio to VC from specified search query')
  .addStringOption((option) => option.setName('query').setDescription('Query (this can be a YouTube URL or a search query)').setRequired(true)),
  async execute(interaction) {
      if (cooldown.has(interaction.user.id)) {
      await interaction.reply({ embeds: [cooldownEmbed] });
      } else {

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

      if (!ytdl.validateURL(query)) {
        let searchResults
        try {
          // searchResults = await invidious.search(query, {type: 'video'}) # Invidious remnant
          searchResults = await yt.searchVideo(query, 5);
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

        // collector
        const filter = i => i.customId === '0' || i.customId === '1' || i.customId === '2' || i.customId === '3' || i.customId === '4'
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 })
        if (debug) log('genLog', { event: 'Commands > Play', content: 'Component collector spawned', extra: [`${executor.tag}`] })

        collector.on('collect', async i => {
          if (i.user.id === executor.id) {
            await i.deferUpdate()
            await i.editReply({ embeds: [patient], components: [] })

            /* selected = await invidious.getVideo(searchResults[i.customId].metadata.id) # Invidious remnant
            link = selected.video.adaptive.find(item => item.itag === '140').url */

            selected = searchResults[i.customId]

            if (debug) log('genWarn', { event: 'Commands > Play', content: 'Executor selected a video', extra: [`${selected.title} by ${selected.author.name}`,`${executor.tag}`] })
            let selectedEmbed = embedConstructor('playSelected', { title: selected.title, name: selected.author.name, thumbnail: selected.bestThumbnail.url });
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
            try {

              let player = voice.createAudioPlayer()
              let stream = ytdl(selected.url, { filter: 'audioonly', dlChunkSize: 0 })
              let resource = voice.createAudioResource(stream)

              connection.subscribe(player)
              player.play(resource)

              log('genLog', { event: 'Commands > Play', content: 'Done.', extra: [`${selected.title} by ${selected.author.name}`,`${executor.tag}`] })

              player.on(voice.AudioPlayerStatus.Idle, () => {
                let timeoutEmbed = embedConstructor('playTimeout')
                interaction.channel.send({ embeds: [timeoutEmbed] })
                connection.destroy()
                log('genLog', { event: 'Commands > Play', content: 'Connection destroyed.', extra: [`${executor.tag}`] })
              })

            } catch (e) {
              log('runtimeErr', { errName: e.name, event: 'Play', content: e.message })
              let embed = embedConstructor('playUnavailable', { query: query })
              interaction.followUp({ embeds: [embed] })
              connection.destroy()
              return
            }
          }
        })
      } else {
        try {

          let selected = await ytdl.getInfo(query);
          selected = selected.videoDetails;
          let thumbnail = selected.thumbnails.pop().url;
          let player = voice.createAudioPlayer()
          let stream = ytdl(selected.video_url, { filter: 'audioonly', dlChunkSize: 0 })
          let resource = voice.createAudioResource(stream)

          connection.subscribe(player)
          player.play(resource)

          log('genLog', { event: 'Commands > Play', content: 'Done.', extra: [`${selected.title} by ${selected.author.name}`,`${executor.tag}`] })

          player.on(voice.AudioPlayerStatus.Idle, () => {
            let timeoutEmbed = embedConstructor('playTimeout')
            interaction.channel.send({ embeds: [timeoutEmbed] })
            connection.destroy()
            log('genLog', { event: 'Commands > Play', content: 'Connection destroyed.', extra: [`${executor.tag}`] })
          })
              
        } catch (e) {
          log('runtimeErr', { errName: e.name, event: 'Play', content: e.message })
          let embed = embedConstructor('playUnavailable', { query: query })
          interaction.followUp({ embeds: [embed] })
          connection.destroy()
          return
        }
      }

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