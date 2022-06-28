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
const { SlashCommandBuilder, codeBlock } = require('@discordjs/builders');
const { embedConstructor, log } = require('../lib/cryoLib.js');
const { debug } = require('../config.json');
const encd = require('@root/encoding');
const b32cd = require('base32-encoding');
const binf = require('bin-converter');
const bincd = new binf();

// set cooldown
const cooldown = new Set();
const cooldownTime = 4000;
const cooldownEmbed = embedConstructor("cooldown", { cooldown: '4 seconds' });

module.exports = {
  data: new SlashCommandBuilder()
  .setName('encode')
  .setDescription('Encode a string to various formats')
  .addStringOption((option) => option.setName('string').setDescription('String to encode').setRequired(true))
  .addStringOption((option) => option.setName('format').setDescription('Format to encode your string into').setRequired(false)
  									 .addChoice('Binary', 'binary')
  									 .addChoice('Hexadecimal', 'hex')
  									 .addChoice('Base32', 'base32')
  									 .addChoice('Base64', 'base64')),
  async execute(interaction) {
      // cooldown management
      if (cooldown.has(interaction.user.id)) {
      await interaction.reply({ embeds: [cooldownEmbed] });
      } else {

        // constants
        const executor = interaction.member;
        const executorTag = executor.user.tag;

        if (debug) { log('genLog', { event: 'Commands > Encode', content: `Command initialized by ${executorTag}` }); };

      	const inputString = interaction.options.getString('string');

      	if (!interaction.options.getString('format')) {

          if (debug) { log('genLog', { event: 'Commands > Encode', content: `Initializing all formats` }); };

      		let buffer = Buffer.from(inputString);
      		let bin = bincd.parseStringToBinary(inputString);
      		let hex = encd.strToHex(inputString);
      		let base32 = b32cd.stringify(Buffer.from(inputString));
      		let base64 = buffer.toString('base64');

          if (bin.length > 1022 || hex.length > 1022 || base32.length > 1022 || base64.length > 1022) {
            if (debug) { log('cmdErr', { event: 'Encode', content: `String is too long to encode in all formats at once` }); };
            let embed = embedConstructor('encodeFailed', { reason: `Specified string is too long to encode in all formats (${inputString.length} character(s)).` })
            interaction.reply({ embeds: [embed] }); 
            return;
          } else {
            if (debug) { log('genLog', { event: 'Commands > Encode', content: `Succeeded encoding in all formats` }); };
            let embed = embedConstructor('encodeSuccess', { results: 
              [
                { name: 'Binary', value: `> ${bin}`, inline: false },
                { name: 'Hexadecimal', value: `> ${hex}`, inline: false },
                { name: 'Base32', value: `> ${base32}`, inline: false },
                { name: 'Base64', value: `> ${base64}`, inline: false },
              ]
            });
            if (debug) { log('genLog', { event: 'Commands > Encode', content: `Replied with all formats` }); };
            interaction.reply({ embeds: [embed] });
          }
      	} else {
          if (interaction.options.getString('format') == 'binary') {
            let bin = bincd.parseStringToBinary(inputString);
            if (bin.length > 2048) {
              if (debug) { log('cmdErr', { event: 'Encode', content: `String is too long to encode in the binary format` }); };
              let embed = embedConstructor('encodeFailed', { reason: `Specified string is too long to encode in the binary format (${inputString.length} character(s)).` })
              interaction.reply({ embeds: [embed] }); 
              return;
            } else {
              if (debug) { log('genLog', { event: 'Commands > Encode', content: `Succeeded encoding in the binary format` }); };
              let embed = embedConstructor('encodeSuccessSingle', { results: `**Binary**:\n> ${bin}` });
              if (debug) { log('genLog', { event: 'Commands > Encode', content: `Replied with binary format` }); };
              interaction.reply({ embeds: [embed] });
            }
          } else if (interaction.options.getString('format') == 'hex') {
            let hex = encd.strToHex(inputString);
            if (hex.length > 2048) {
              if (debug) { log('cmdErr', { event: 'Encode', content: `String is too long to encode in the hexadecimal format` }); };
              let embed = embedConstructor('encodeFailed', { reason: `Specified string is too long to encode in the hexadecimal format (${inputString.length} character(s)).` })
              interaction.reply({ embeds: [embed] }); 
              return;
            } else {
              if (debug) { log('genLog', { event: 'Commands > Encode', content: `Succeeded encoding in the hexadecimal format` }); };
              let embed = embedConstructor('encodeSuccessSingle', { results: `**Hexadecimal**:\n> ${hex}` });
              if (debug) { log('genLog', { event: 'Commands > Encode', content: 'Replied with hexadecimal format' }); };
              interaction.reply({ embeds: [embed] });
            }
          } else if (interaction.options.getString('format') == 'base32') {
            let base32 = b32cd.stringify(Buffer.from(inputString));
            if (base32.length > 2048) {
              if (debug) { log('cmdErr', { event: 'Encode', content: `String is too long to encode in the base32 format` }); };
              let embed = embedConstructor('encodeFailed', { reason: `Specified string is too long to encode in the Base32 format (${inputString.length} character(s)).` })
              interaction.reply({ embeds: [embed] }); 
              return;
            } else {
              if (debug) { log('genLog', { event: 'Commands > Encode', content: `Succeeded encoding in the base32 format` }); };
              let embed = embedConstructor('encodeSuccessSingle', { results: `**Base32**:\n> ${base32}` });
              if (debug) { log('genLog', { event: 'Commands > Encode', content: 'Replied with base32 format' }); };
              interaction.reply({ embeds: [embed] });
            }
          } else if (interaction.options.getString('format') == 'base64') {
            let buffer = Buffer.from(inputString);
            let base64 = buffer.toString('base64');
            if (base64.length > 2048) {
              if (debug) { log('cmdErr', { event: 'Encode', content: `String is too long to encode in the base64 format` }); };
              let embed = embedConstructor('encodeFailed', { reason: `Specified string is too long to encode in the Base64 format (${inputString.length} character(s)).` })
              interaction.reply({ embeds: [embed] }); 
              return;
            } else {
              if (debug) { log('genLog', { event: 'Commands > Encode', content: `Succeeded encoding in the base64 format` }); };
              let embed = embedConstructor('encodeSuccessSingle', { results: `**Base64**:\n> ${base64}` });
              if (debug) { log('genLog', { event: 'Commands > Encode', content: 'Replied with base64 format' }); };
              interaction.reply({ embeds: [embed] });
            }
          }
        }
      	
        // cooldown management
      	cooldown.add(interaction.user.id);
        setTimeout(() => { cooldown.delete(interaction.user.id); }, cooldownTime);

      	}
    }
}
