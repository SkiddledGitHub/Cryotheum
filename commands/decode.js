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
const { embedConstructor } = require('../lib/embeds.js');
const { log } = require('../lib/logging.js');
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
  .setName('decode')
  .setDescription('Decode a string from various formats')
  .addStringOption((option) => option.setName('string').setDescription('String to decode').setRequired(true))
  .addStringOption((option) => option.setName('format').setDescription('Format to decode your string from').setRequired(true)
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

        if (debug) { log('genLog', { event: 'Commands > Decode', content: `Command initialized by ${executorTag}` }); };

        const inputString = interaction.options.getString('string');

        if (!interaction.options.getString('format')) {

            if (debug) { log('cmdErr', { event: 'Decode', content: 'Cannot decode in all formats' }); };
            let embed = embedConstructor('decodeFailed', { reason: 'You cannot decode in all formats!' });
            interaction.reply({ embeds: [embed] });
            return;

        } else {
          if (interaction.options.getString('format') == 'binary') {
            try {
                let bin = bincd.parseBinaryFromString(inputString);
                if (bin.length > 2048) {
                    if (debug) { log('cmdErr', { event: 'Decode', content: `String is too long to decode from the binary format` }); };
                    let embed = embedConstructor('decodeFailed', { reason: `Specified string is too long to decode from the binary format (${inputString.length} character(s)).` })
                    interaction.reply({ embeds: [embed] }); 
                    return;
                } else {
                    if (debug) { log('genLog', { event: 'Commands > Decode', content: `Succeeded decoding from the binary format` }); };
                    let embed = embedConstructor('decodeSuccess', { results: `**Binary**:\n> ${bin}` });
                    if (debug) { log('genLog', { event: 'Commands > Decode', content: `Replied with decoded string` }); };
                    interaction.reply({ embeds: [embed] });
                }
            } catch (error) {
                if (debug) { log('runtimeErr', { event: 'Decode', errName: error.name, content: error.message }) };
                let embed = embedConstructor('decodeFailed', { reason: 'String provided is not a binary string!' });
                interaction.reply({ embeds: [embed] });
            }
          } else if (interaction.options.getString('format') == 'hex') {
            let hex = encd.hexToStr(inputString);
            if (!hex) {
              if (debug) { log('cmdErr', { event: 'Decode', content: 'String provided is not a hexadecimal string' }); };
              let embed = embedConstructor('decodeFailed', { reason: 'String provided is not a hexadecimal string!' });
              interaction.reply({ embeds: [embed] });
              return;
            }
            if (hex.length > 2048) {
              if (debug) { log('cmdErr', { event: 'Decode', content: `String is too long to decode from the hexadecimal format` }); };
              let embed = embedConstructor('decodeFailed', { reason: `Specified string is too long to decode from the hexadecimal format (${inputString.length} character(s)).` })
              interaction.reply({ embeds: [embed] }); 
              return;
            } else {
              if (debug) { log('genLog', { event: 'Commands > Decode', content: `Succeeded decoding from the hexadecimal format` }); };
              let embed = embedConstructor('decodeSuccess', { results: `**Hexadecimal**:\n> ${hex}` });
              if (debug) { log('genLog', { event: 'Commands > Decode', content: 'Replied with decoded string' }); };
              interaction.reply({ embeds: [embed] });
            }
          } else if (interaction.options.getString('format') == 'base32') {
            let base32 = b32cd.parse(inputString).toString('utf8');
            if (base32.length > 2048) {
              if (debug) { log('cmdErr', { event: 'Decode', content: `String is too long to decode from the base32 format` }); };
              let embed = embedConstructor('decodeFailed', { reason: `Specified string is too long to decode from the Base32 format (${inputString.length} character(s)).` })
              interaction.reply({ embeds: [embed] }); 
              return;
            } else {
              if (debug) { log('genLog', { event: 'Commands > Decode', content: `Succeeded decoding from the base32 format` }); };
              let embed = embedConstructor('decodeSuccess', { results: `**Base32**:\n> ${base32}` });
              if (debug) { log('genLog', { event: 'Commands > Decode', content: 'Replied with decoded string' }); };
              interaction.reply({ embeds: [embed] });
            }
          } else if (interaction.options.getString('format') == 'base64') {
            let buffer = Buffer.from(inputString, 'base64');
            let base64 = buffer.toString('utf8');
            if (base64.length > 2048) {
              if (debug) { log('cmdErr', { event: 'Decode', content: `String is too long to decode from the base64 format` }); };
              let embed = embedConstructor('decodeFailed', { reason: `Specified string is too long to decode from the Base64 format (${inputString.length} character(s)).` })
              interaction.reply({ embeds: [embed] }); 
              return;
            } else {
              if (debug) { log('genLog', { event: 'Commands > Decode', content: `Succeeded decoding from the base64 format` }); };
              let embed = embedConstructor('decodeSuccess', { results: `**Base64**:\n> ${base64}` });
              if (debug) { log('genLog', { event: 'Commands > Decode', content: 'Replied with decoded string' }); };
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
