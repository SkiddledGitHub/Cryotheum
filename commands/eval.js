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

// discord.js modules
const { SlashCommandBuilder, codeBlock } = require('discord.js');

// 3rd party modules
const { embedConstructor } = require('../lib/embeds.js');
const { log } = require('../lib/logging.js');

// data
const { debug, botOwner } = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
  	.setName('eval')
  	.setDescription('Evaluate JS code. Restricted to bot owner (for obvious reasons)')
  	.addStringOption((option) => option.setName('code').setDescription('Code to evaluate').setRequired(true))
    .addBooleanOption((option) => option.setName('async').setDescription('Make the code run in an async function').setRequired(false)),
  async execute(interaction) {

      // constants
      const executor = { obj: interaction.member, tag: interaction.user.tag, id: interaction.user.id }
      const code = interaction.options.getString('code')
      const codeHighlighted = codeBlock('js', code)

      // variables
      var embed

      if (debug) log('genLog', { event: 'Commands > Eval', content: `Initialize`, extra: [`${executor.tag}`] })

        // if user is not bot owner, pull error
      	if (executor.id != botOwner) {

          // set embed & reply & log fail
          let embed = embedConstructor('evalFailed', { reason: 'You are not the bot owner!', code: `${codeHighlighted}` })
          if (interaction.isRepliable()) {
            interaction.reply({ embeds: [embed] })
          } else {
            try {
              interaction.followUp({ embeds: [embed] })
            } catch (e) {
              interaction.channel.send({ embeds: [embed] })
            }
          }
          if (debug) log('genWarn', { event: 'Commands > Eval', content: `Failed.`, extra: [`${executor.tag}`], cause: 'Executor is not bot owner.' })
          log('genLog', { event: 'Commands > Eval', content: `Done${debug ? '' : ' with suppressed warnings'}.` })
          return

        } else {

          // defer
          await interaction.deferReply()

          // set embed
          if (code.length > 1020) {
            embed = embedConstructor('evalSuccess', { code: `Too long to display\n(${code.length} characters)` })
          } else {
            embed = embedConstructor('evalSuccess', { code: `${codeHighlighted}` })
          }

          // execute
          let errObj
          if (debug) log('genLog', { event: 'Commands > Eval', content: 'Executing', extra: [`${code}`, `${executor.tag}`] })
          if (interaction.options.getBoolean('async')) {
            try { await eval(`try { let i = interaction; async function evaluation() { ${code} }; evaluation(); } catch (e) { errObj = e; }`); } catch (e) { errObj = e }
          } else {
            try { await eval(`try { let i = interaction; ${code} } catch (e) { errObj = e; }`); } catch (e) { errObj = e; }
          }

          if (errObj) {
            // set embed
            if (debug) log('cmdErr', { event: 'Commands > Eval', content: `Evaluation failed.`, extra: [`${executor.tag}`] })
            if (code.length > 1020) {
              embed = embedConstructor('evalFailed', { reason: errObj.message, code: `Too long to display\n(${code.length} characters)` })
            } else {
              embed = embedConstructor('evalFailed', { reason: errObj.message, code: `${codeHighlighted}` })
            };

            // reply
            try {
              interaction.editReply({ embeds: [embed] })
            } catch (e) {
              if (!interaction.isRepliable()) {
                try {
                  interaction.followUp({ embeds: [embed] })
                } catch (e) {
                  interaction.channel.send({ embeds: [embed] })
                }
              }
            }

            // throw
            if (debug) log('runtimeErr', { event: 'Commands > Eval', errName: errObj.name, content: errObj.message, extra: [`${code}`,`${executor.tag}`] })
            return

          } else {

            // reply
            try {
              interaction.editReply({ embeds: [embed] })
            } catch (e) {
              if (!interaction.isRepliable()) {
                try {
                  interaction.followUp({ embeds: [embed] })
                } catch (e) {
                  interaction.channel.send({ embeds: [embed] })
                }
              }
            }

            // log success
            log('genLog', { event: 'Commands > Eval', content: `Evaluated code.`, extra: [`${code}`,`${executor.tag}`] });

          }
          
        }
  	},
  documentation: {
    name: 'eval',
    category: 'Utility',
    description: 'Evaluate JS code. Restricted to bot owner (for obvious reasons)',
    syntax: '/eval code:[String] async:[Boolean]',
    arguments: [
      { name: 'code', targetValue: 'String', description: 'Code to evaluate' },
      { name: 'async', targetValue: 'Boolean [Optional Selection]', description: 'Make the code run in an async function.', selection: '*`True`* | *`False`*' }
    ]
  }
}