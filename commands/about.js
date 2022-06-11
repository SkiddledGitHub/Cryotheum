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
const { embedCreator } = require('../tools/embeds.js');
const { debug, botOwner } = require('../config.json');
const { log } = require('../tools/loggingUtil.js');

// set cooldown
const cooldown = new Set();
const cooldownTime = 1000;

module.exports = {
  data: new SlashCommandBuilder()
  .setName('about')
  .setDescription('Display information about the bot'),
  async execute(interaction) {
      if (cooldown.has(interaction.user.id)) {
      await interaction.reply({ 
          embeds: [cooldownEmbed], 
          ephemeral: true 
        });
      } else {
        
        let embed = embedCreator('about', { uptime: Math.floor(interaction.client.readyTimestamp / 1000), botOwnerID: botOwner, debugStatus: `${debug}` });
        interaction.reply({ embeds: [embed] });
        
        cooldown.add(interaction.user.id);
            setTimeout(() => {
            // rm cooldown after it has passed
            cooldown.delete(interaction.user.id);
            }, cooldownTime);
        }
  }
}