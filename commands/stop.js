const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection, VoiceConnectionStatus, AudioPlayer, AudioResource } = require('@discordjs/voice');
const voice = require('@discordjs/voice');

const { embedConstructor } = require('../lib/embeds.js');
const { log } = require('../lib/logging.js');

const { debug } = require('../config.json');

const cooldown = new Set();
const cooldownTime = 6000;
const cooldownEmbed = embedConstructor("cooldown", { cooldown: '6 seconds' });

module.exports = {
  data: new SlashCommandBuilder()
  .setName('stop')
  .setDescription('Make the bot leave the VC'),
  async execute(interaction) {
      if (cooldown.has(interaction.user.id)) {
      await interaction.reply({ embeds: [cooldownEmbed] });
      } else {

      // constants
      const executor = { obj: interaction.member, tag: interaction.user.tag, id: interaction.user.id, guild: interaction.guild }
      const channel = executor.guild.members.me.voice.channel

      if (debug) log('genLog', { event: 'Commands > Stop', content: `Initialize`, extra: [`${executor.tag}`] })

      // if bot not in channel, pull error
      if (!channel) {
        if (debug) log('genWarn', { event: 'Commands > Stop', content: 'Failed.', cause: 'Bot is not connected to a voice channel in specified guild.', extra: [`${executor.tag}`] })
        let embed = embedConstructor('stopFailed', { reason: 'The bot is not in a voice channel!' })
        interaction.reply({ embeds: [embed] })
        log('genLog', { event: 'Commands > Stop', content: `Done${debug ? '' : ' with suppressed warnings'}.`, extra: [`${executor.tag}`] })
        return
      }

      // get connection
      const connection = getVoiceConnection(executor.guild.id)

      // destroy the connection
      connection.destroy()
      if (debug) log('genLog', { event: 'Commands > Stop', content: `Connection destroyed.`, extra: [`${executor.tag}`] })
      const successEmbed = embedConstructor('stopSuccess')
      await interaction.reply({ embeds: [successEmbed] })
      log('genLog', { event: 'Commands > Stop', content: `Done.`, extra: [`${executor.tag}`] })

      // cooldown management
      cooldown.add(interaction.user.id)
      setTimeout(() => { cooldown.delete(interaction.user.id); }, cooldownTime)

    }
  },
  documentation: {
    name: 'stop',
    category: 'Media',
    description: 'Make the bot leave the VC',
    syntax: '/stop',
    cooldown: `${Math.round(cooldownTime / 1000)} seconds`,
    arguments: []
  }
}
