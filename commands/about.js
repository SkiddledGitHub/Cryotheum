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
const { embedConstructor, log } = require('../lib/cryoLib.js');
const { debug, botOwner } = require('../config.json');

// set cooldown
const cooldown = new Set();
const cooldownTime = 1000;

module.exports = {
  data: new SlashCommandBuilder()
  .setName('about')
  .setDescription('Display information about the bot'),
  async execute(interaction) {
      // cooldown management
      if (cooldown.has(interaction.user.id)) {
      await interaction.reply({ embeds: [cooldownEmbed] });
      } else {
        
        // constants
        const executor = interaction.member;
        const executorTag = executor.user.tag;

        if (debug) { log('genLog', { event: 'Commands > About', content: `Command initialized by ${executorTag}` }); };

        if (debug) { log('genLog', { event: 'Commands > About', content: `Constructing embed` }); };
        let embed = embedConstructor('about', { uptime: Math.floor(interaction.client.readyTimestamp / 1000), botOwnerID: botOwner, debugStatus: `${debug}` });
        if (debug) { log('genLog', { event: 'Commands > About', content: `Replying with embed` }); };
        interaction.reply({ embeds: [embed] });
        
        // cooldown management
        cooldown.add(interaction.user.id);
        setTimeout(() => { cooldown.delete(interaction.user.id); }, cooldownTime);
        
        }
    }
}