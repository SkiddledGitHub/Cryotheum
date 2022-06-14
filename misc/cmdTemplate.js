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
const { embedConstructor, log } = require('../tools/cryoLib.js');
const { debug } = require('../config.json');

// set cooldown
const cooldown = new Set();
const cooldownTime = 1000;
const cooldownEmbed = embedConstructor("cooldown", { cooldown: '1 seconds' });

module.exports = {
  data: new SlashCommandBuilder()
  .setName('template')
  .setDescription('cmd template'),
  async execute(interaction) {
    // cooldown management
    if (cooldown.has(interaction.user.id)) {
    await interaction.reply({ embeds: [cooldownEmbed] });
      } else {

      	// insert commands
        console.log('test');
        interaction.reply('test');

        // custom logging
        log('genLog', { event: 'test', content: 'test' });
      	
        // cooldown management
      	cooldown.add(interaction.user.id);
        setTimeout(() => { cooldown.delete(interaction.user.id); }, cooldownTime);

      }
  }
}
