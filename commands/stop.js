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
 * You should have received a copy of the GNU General Public License along with Foobar. 
 * If not, see <https://www.gnu.org/licenses/>.
 *
 */

// modules
const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, getVoiceConnection, VoiceConnectionStatus, AudioPlayer, AudioResource } = require('@discordjs/voice');
const voice = require('@discordjs/voice');
const { debug } = require('../config.json');
const { embedCreator } = require('../tools/embeds.js');
const { log } = require('../tools/loggingUtil.js');

// set cooldown
const cooldown = new Set();
const cooldownTime = 6000;
const cooldownEmbed = embedCreator("cooldown", { cooldown: '6 seconds' });

module.exports = {
  data: new SlashCommandBuilder()
  .setName('stop')
  .setDescription('Make the bot leave the VC'),
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
      const channel = executor.guild.me.voice.channel;

      // if user not in channel, pull error
      if (channel == null) { const embed = embedCreator('stopFailed', { reason: 'The bot is not in a voice channel!' }); async function failed() { await interaction.reply({ embeds: [embed] }); }; failed(); return; };

      // get connection
      const connection = getVoiceConnection(executor.guild.id);

      // destroy the connection
      connection.destroy();
      const successEmbed = embedCreator('stopSuccess');
      await interaction.reply({ embeds: [successEmbed] });

      	cooldown.add(interaction.user.id);
        	setTimeout(() => {
          	// rm cooldown after it has passed
          	cooldown.delete(interaction.user.id);
        	}, cooldownTime);
      	}
  }
}
