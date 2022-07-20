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
  .setName('decode')
  .setDescription('Decode a string from various formats')
  .addStringOption((option) => option.setName('string').setDescription('String to decode').setRequired(true))
  .addStringOption((option) => option.setName('format').setDescription('Format to decode your string from').setRequired(true)
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
        const executor = { obj: interaction.member, tag: interaction.user.tag };

        if (debug) log('genLog', { event: 'Commands > Decode', content: `Initialize`, extra: [`${executor.tag}`] })

        const inputString = interaction.options.getString('string')
        if (interaction.options.getString('format') == 'binary') {
          try {
            let bin = bincd.parseBinaryFromString(inputString)
            if (bin.length > 2048) {
              if (debug) log('cmdErr', { event: 'Commands > Decode', content: `Failed.`, cause: `String too long: ${bin.length}/2048 chars`, extra: [`Method: Binary`,`${executor.tag}`] })
              let embed = embedConstructor('decodeFailed', { reason: `Output string is too long: ${bin.length}/2048 characters.` })
              interaction.reply({ embeds: [embed] })
              log('genLog', { event: 'Commands > Decode', content: `Done${debug ? '' : ' with suppressed errors'}.`, extra: [`${executor.tag}`] })
              return
            } else {
              if (debug) log('genLog', { event: 'Commands > Decode', content: `Decode success.`, extra: [`Method: Binary`,`${executor.tag}`] })
              let embed = embedConstructor('decodeSuccess', { results: `**Binary**:\n> ${bin}` })
              interaction.reply({ embeds: [embed] })
              log('genLog', { event: 'Commands > Decode', content: `Done.`, extra: [`Method: Binary`,`${executor.tag}`] })
            }
          } catch (error) {
            if (debug) { log('runtimeErr', { event: 'Commands > Decode', errName: error.name, content: error.message }) };
            let embed = embedConstructor('decodeFailed', { reason: 'String provided is not a binary string!' });
            interaction.reply({ embeds: [embed] });
          }
        } else if (interaction.options.getString('format') == 'hex') {
          let hex = encd.hexToStr(inputString)
          if (!hex) {
            if (debug) log('cmdErr', { event: 'Commands > Decode', content: 'Failed.', extra: [`Method: Hexadecimal`,`${executor.tag}`], cause: 'Expected string with hexadecimal values' })
            let embed = embedConstructor('decodeFailed', { reason: 'String provided is not a hexadecimal string!' })
            interaction.reply({ embeds: [embed] })
            log('genLog', { event: 'Commands > Decode', content: `Done${debug ? '' : ' with suppressed errors'}.`, extra: [`Method: Hexadecimal`,`${executor.tag}`] })
            return
          }
          if (hex.length > 2048) {
            if (debug) log('cmdErr', { event: 'Commands > Decode', content: `String too long: ${hex.length}/2048 chars`, extra: [`Method: Hexadecimal`,`${executor.tag}`] })
            let embed = embedConstructor('decodeFailed', { reason: `Output string is too long: ${hex.length}/2048 characters.` })
            interaction.reply({ embeds: [embed] })
            log('genLog', { event: 'Commands > Decode', content: `Done${debug ? '' : ' with suppressed errors'}.`, extra: [`Method: Hexadecimal`,`${executor.tag}`] })
            return
          } else {
            if (debug) log('genLog', { event: 'Commands > Decode', content: `Decode success.`, extra: [`Method: Hexadecimal`,`${executor.tag}`] })
            let embed = embedConstructor('decodeSuccess', { results: `**Hexadecimal**:\n> ${hex}` })
            log('genLog', { event: 'Commands > Decode', content: `Done.`, extra: [`Method: Hexadecimal`,`${executor.tag}`] })
            interaction.reply({ embeds: [embed] })
          }
        } else if (interaction.options.getString('format') == 'base32') {
          let base32 = b32cd.parse(inputString).toString('utf8')
          if (base32.length > 2048) {
            if (debug) log('cmdErr', { event: 'Commands > Decode', content: `String too long: ${base32.length}/2048 chars`, extra: [`Method: Base32`,`${executor.tag}`] })
            let embed = embedConstructor('decodeFailed', { reason: `Output string is too long: ${base32.length}/2048 characters.` })
            interaction.reply({ embeds: [embed] })
            log('genLog', { event: 'Commands > Decode', content: `Done${debug ? '' : ' with suppressed errors'}.`, extra: [`Method: Base32`,`${executor.tag}`] })
            return
          } else {
            if (debug) log('genLog', { event: 'Commands > Decode', content: `Decode success.`, extra: [`Method: Base32`,`${executor.tag}`] })
            let embed = embedConstructor('decodeSuccess', { results: `**Base32**:\n> ${base32}` })
            log('genLog', { event: 'Commands > Decode', content: `Done.`, extra: [`Method: Base32`,`${executor.tag}`] })
            interaction.reply({ embeds: [embed] })
          }
        } else if (interaction.options.getString('format') == 'base64') {
          let buffer = Buffer.from(inputString, 'base64')
          let base64 = buffer.toString('utf8')
          if (base64.length > 2048) {
            if (debug) log('cmdErr', { event: 'Commands > Decode', content: `String too long: ${base64.length}/2048 chars`, extra: [`Method: Base64`,`${executor.tag}`] })
            let embed = embedConstructor('decodeFailed', { reason: `Output string is too long: ${base64.length}/2048 characters.` })
            interaction.reply({ embeds: [embed] })
            log('genLog', { event: 'Commands > Decode', content: `Done${debug ? '' : ' with suppressed errors'}.`, extra: [`Method: Base64`,`${executor.tag}`] })
            return
          } else {
            if (debug) log('genLog', { event: 'Commands > Decode', content: `Decode success.`, extra: [`Method: Base64`,`${executor.tag}`] })
            let embed = embedConstructor('decodeSuccess', { results: `**Base64**:\n> ${base64}` })
            log('genLog', { event: 'Commands > Decode', content: `Done.`, extra: [`Method: Base64`,`${executor.tag}`] })
            interaction.reply({ embeds: [embed] })
          }
        }
        
      // cooldown management
      cooldown.add(interaction.user.id)
      setTimeout(() => { cooldown.delete(interaction.user.id); }, cooldownTime)

    }
  },
  documentation: {
    name: 'decode',
    category: 'Utility',
    description: 'Decode a string from various formats',
    syntax: '/decode string:[String] format:[StringSelection]',
    cooldown: `${Math.round(cooldownTime / 1000)} seconds`,
    arguments: [
      { name: 'string', targetValue: 'String', description: 'String to decode' },
      { name: 'format', targetValue: 'String [Selection]', description: 'Format to decode your string from.', selection: '*`binary`* | *`hex`* | *`base32`* | *`base64`*' }
    ]
  }
}
