/**
 *
 * Copyright 2022 SkiddledGitHub
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
const { embedConstructor } = require('../lib/embeds.js');
const { log } = require('../lib/logging.js');

// set cooldown
const cooldown = new Set();
const cooldownTime = 6000;
const cooldownEmbed = embedConstructor("cooldown", { cooldown: '6 seconds' });

module.exports = {
  data: new SlashCommandBuilder()
  .setName('stop')
  .setDescription('Make the bot leave the VC'),
  async execute(interaction) {
      // cooldown management
      if (cooldown.has(interaction.user.id)) {
      await interaction.reply({ embeds: [cooldownEmbed] });
      } else {

      // constants
      const executor = { obj: interaction.member, tag: interaction.user.tag, id: interaction.user.id, guild: interaction.guild };
      const channel = executor.guild.me.voice.channel;

      if (debug) { log('genLog', { event: 'Commands > Stop', content: `Command initialized by ${executor.tag}` }); };

      // if bot not in channel, pull error
      if (!channel) { 
        const embed = embedConstructor('stopFailed', { reason: 'The bot is not in a voice channel!' }); 
        async function failed() { await interaction.reply({ embeds: [embed] }); }; failed();
        if (debug) { log('cmdErr', { event: 'Stop', content: `Bot is not in a voice channel` }); };
        return; 
      };

      // get connection
      if (debug) { log('genLog', { event: 'Commands > Stop', content: `Getting connection` }); };
      const connection = getVoiceConnection(executor.guild.id);

      // destroy the connection
      if (debug) { log('genLog', { event: 'Commands > Stop', content: `Attempting to destroy connection` }); };
      connection.destroy();
      if (debug) { log('genLog', { event: 'Commands > Stop', content: `Connection destroyed.` }); };
      const successEmbed = embedConstructor('stopSuccess');
      if (debug) { log('genLog', { event: 'Commands > Stop', content: `Replying with success embed` }); };
      await interaction.reply({ embeds: [successEmbed] });

      // cooldown management
      cooldown.add(interaction.user.id);
      setTimeout(() => { cooldown.delete(interaction.user.id); }, cooldownTime);

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
