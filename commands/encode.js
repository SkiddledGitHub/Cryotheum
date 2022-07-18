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
const { SlashCommandBuilder, codeBlock } = require('discord.js');

// 3rd party modules
const encd = require('@root/encoding');
const b32cd = require('base32-encoding');
const binf = require('bin-converter');
const bincd = new binf();

// custom modules
const { embedConstructor } = require('../lib/embeds.js');
const { log } = require('../lib/logging.js');

// data
const { debug } = require('../config.json');

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
    .addChoices(
      { name: 'Binary', value: 'binary' },
      { name: 'Hexadecimal', value: 'hex' },
      { name: 'Base32', value: 'base32' },
      { name: 'Base64', value: 'base64' }
    )),
  async execute(interaction) {
      // cooldown management
      if (cooldown.has(interaction.user.id)) {
      await interaction.reply({ embeds: [cooldownEmbed] });
      } else {

        // constants
        const executor = { obj: interaction.member, tag: interaction.user.tag }

        if (debug) log('genLog', { event: 'Commands > Encode', content: `Initialize`, extra: [`${executor.tag}`] })

      	const inputString = interaction.options.getString('string')

      	if (!interaction.options.getString('format')) {

          if (debug) log('genLog', { event: 'Commands > Encode', content: `Initialize`, extra: [`Method: All`,`${executor.tag}`] })

      		let buffer = Buffer.from(inputString)
      		let bin = bincd.parseStringToBinary(inputString)
      		let hex = encd.strToHex(inputString)
      		let base32 = b32cd.stringify(Buffer.from(inputString))
      		let base64 = buffer.toString('base64')

          if (bin.length > 1022 || hex.length > 1022 || base32.length > 1022 || base64.length > 1022) {
            if (debug) log('cmdErr', { event: 'Commands > Encode', content: 'Failed.', cause: `At least one format produced a string longer than 1024 chars`,
              extra: [
                `Method: All`,
                `Binary: ${bin.length > 1022 ? 'At fault' : 'Passed'}`,
                `Hexadecimal: ${hex.length > 1022 ? 'At fault' : 'Passed'}`,
                `Base32: ${base32.length > 1022 ? 'At fault' : 'Passed'}`,
                `Base64: ${base64.length > 1022 ? 'At fault' : 'Passed'}`,
                `${executor.tag}`
              ]})
            let embed = embedConstructor('encodeFailed', { reason: `Output strings are too long.` })
            interaction.reply({ embeds: [embed] }) 
            log('genLog', { event: 'Commands > Encode', content: `Done${debug ? '' : ' with suppressed errors'}.`, extra: [`Method: All`,`${executor.tag}`] })
            return
          } else {
            if (debug) log('genLog', { event: 'Commands > Encode', content: `Encode success.`, extra: [`Method: All`,`${executor.tag}`] })
            let embed = embedConstructor('encodeSuccess', { results: 
              [
                { name: 'Binary', value: `> ${bin}`, inline: false },
                { name: 'Hexadecimal', value: `> ${hex}`, inline: false },
                { name: 'Base32', value: `> ${base32}`, inline: false },
                { name: 'Base64', value: `> ${base64}`, inline: false },
              ]
            })
            log('genLog', { event: 'Commands > Encode', content: `Done.`, extra: [`Method: All`,`${executor.tag}`] })
            interaction.reply({ embeds: [embed] })
          }
      	} else {
          if (interaction.options.getString('format') == 'binary') {
            let bin = bincd.parseStringToBinary(inputString)
            if (bin.length > 2048) {
              if (debug) log('cmdErr', { event: 'Commands > Encode', content: `Failed.`, cause: `String too long: ${bin.length}/2048 chars`, extra: [`Method: Binary`,`${executor.tag}`] })
              let embed = embedConstructor('encodeFailed', { reason: `Output string is too long: ${bin.length}/2048 characters.` })
              interaction.reply({ embeds: [embed] })
              log('genLog', { event: 'Commands > Encode', content: `Done${debug ? '' : ' with suppressed errors'}.`, extra: [`Method: Binary`,`${executor.tag}`] })
              return
            } else {
              if (debug) log('genLog', { event: 'Commands > Encode', content: `Encode success.`, extra: [`Method: Binary`,`${executor.tag}`] })
              let embed = embedConstructor('encodeSuccessSingle', { results: `**Binary**:\n> ${bin}` })
              interaction.reply({ embeds: [embed] })
              log('genLog', { event: 'Commands > Encode', content: `Done.`, extra: [`Method: Binary`,`${executor.tag}`] })
            }
          } else if (interaction.options.getString('format') == 'hex') {
            let hex = encd.strToHex(inputString);
            if (hex.length > 2048) {
              if (debug) log('cmdErr', { event: 'Commands > Encode', content: `Failed.`, cause: `String too long: ${hex.length}/2048 chars`, extra: [`Method: Hexadecimal`,`${executor.tag}`] })
              let embed = embedConstructor('encodeFailed', { reason: `Output string is too long: ${hex.length}/2048 characters.` })
              interaction.reply({ embeds: [embed] })
              log('genLog', { event: 'Commands > Encode', content: `Done${debug ? '' : ' with suppressed errors'}.`, extra: [`Method: Hexadecimal`,`${executor.tag}`] })
              return
            } else {
              if (debug) log('genLog', { event: 'Commands > Encode', content: `Encode success.`, extra: [`Method: Hexadecimal`,`${executor.tag}`] })
              let embed = embedConstructor('encodeSuccessSingle', { results: `**Hexadecimal**:\n> ${hex}` })
              interaction.reply({ embeds: [embed] })
              log('genLog', { event: 'Commands > Encode', content: `Done.`, extra: [`Method: Hexadecimal`,`${executor.tag}`] })
            }
          } else if (interaction.options.getString('format') == 'base32') {
            let base32 = b32cd.stringify(Buffer.from(inputString))
            if (base32.length > 2048) {
              if (debug) log('cmdErr', { event: 'Commands > Encode', content: `Failed.`, cause: `String too long: ${base32.length}/2048 chars`, extra: [`Method: Base32`,`${executor.tag}`] })
              let embed = embedConstructor('encodeFailed', { reason: `Output string is too long: ${base32.length}/2048 characters.` })
              interaction.reply({ embeds: [embed] })
              log('genLog', { event: 'Commands > Encode', content: `Done${debug ? '' : ' with suppressed errors'}.`, extra: [`Method: Base32`,`${executor.tag}`] })
              return
            } else {
              if (debug) log('genLog', { event: 'Commands > Encode', content: `Encode success.`, extra: [`Method: Base32`,`${executor.tag}`] })
              let embed = embedConstructor('encodeSuccessSingle', { results: `**Base32**:\n> ${base32}` })
              interaction.reply({ embeds: [embed] })
              log('genLog', { event: 'Commands > Encode', content: `Done.`, extra: [`Method: Base32`,`${executor.tag}`] })
            }
          } else if (interaction.options.getString('format') == 'base64') {
            let buffer = Buffer.from(inputString)
            let base64 = buffer.toString('base64')
            if (base64.length > 2048) {
              if (debug) log('cmdErr', { event: 'Commands > Encode', content: `Failed.`, cause: `String too long: ${base64.length}/2048 chars`, extra: [`Method: Base32`,`${executor.tag}`] })
              let embed = embedConstructor('encodeFailed', { reason: `Output string is too long: ${base64.length}/2048 characters.` })
              interaction.reply({ embeds: [embed] })
              log('genLog', { event: 'Commands > Encode', content: `Done${debug ? '' : ' with suppressed errors'}.`, extra: [`Method: Base64`,`${executor.tag}`] })
              return
            } else {
              if (debug) log('genLog', { event: 'Commands > Encode', content: `Encode success.`, extra: [`Method: Base64`,`${executor.tag}`] })
              let embed = embedConstructor('encodeSuccessSingle', { results: `**Base64**:\n> ${base64}` })
              interaction.reply({ embeds: [embed] })
              log('genLog', { event: 'Commands > Encode', content: `Done.`, extra: [`Method: Base64`,`${executor.tag}`] })
            }
          }
        }
      	
        // cooldown management
      	cooldown.add(interaction.user.id);
        setTimeout(() => { cooldown.delete(interaction.user.id); }, cooldownTime);

      	}
    },
  documentation: {
    name: 'encode',
    category: 'Utility',
    description: 'Encode a string to various formats.',
    syntax: '/encode string:[String] format:[StringSelection]',
    cooldown: `${Math.round(cooldownTime / 1000)} seconds`,
    arguments: [
      { name: 'string', targetValue: 'String', description: 'String to encode' },
      { name: 'format', targetValue: 'String [Optional Selection]', description: 'Format to encode your string into.', selection: '*`binary`* | *`hex`* | *`base32`* | *`base64`*' }
    ]
  }
}
