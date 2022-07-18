/**
 * @license
 * @copyright Copyright 2022 ZenialDev
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
const { SlashCommandBuilder } = require('discord.js');

// custom modules
const { log } = require('../lib/logging.js');
const { embedConstructor } = require('../lib/embeds.js');

// data
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
        const executor = { obj: interaction.member, tag: interaction.member.user.tag }

        if (debug) log('genLog', { event: 'Commands > About', content: `Initialize`, extra: [`${executor.tag}`] })

        let embed = embedConstructor('about', { uptime: Math.floor(interaction.client.readyTimestamp / 1000), botOwnerID: botOwner, debugStatus: `${debug}` })
        interaction.reply({ embeds: [embed] })
        if (debug) log('genLog', { event: 'Commands > About', content: `Done.` })
        
        // cooldown management
        cooldown.add(interaction.user.id)
        setTimeout(() => { cooldown.delete(interaction.user.id); }, cooldownTime)
        
        }
    },
  documentation: {
    name: 'about',
    category: 'Information',
    description: 'Display information about the bot.',
    syntax: '/about',
    cooldown: `${Math.round(cooldownTime / 1000)} seconds`,
    arguments: []
  }
}