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
const { debug, botOwner } = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
  	.setName('eval')
  	.setDescription('Evaluate JS code. Restricted to bot owner (for obvious reasons)')
  	.addStringOption((option) => option.setName('code').setDescription('Code to evaluate').setRequired(true))
    .addBooleanOption((option) => option.setName('async').setDescription('Make the code run in an async function').setRequired(false)),
  async execute(interaction) {

      // constants
      const executor = { obj: interaction.member, tag: interaction.user.tag, id: interaction.user.id };
      const code = interaction.options.getString('code');
      const codeHighlighted = codeBlock('js', code);

      // variables
      var embed;

      if (debug) { log('genLog', { event: 'Commands > Eval', content: `Command initialized by ${executor.tag}` }); };

        // if user is not bot owner, pull error
      	if (executor.id != botOwner) {

          // set embed & reply & log fail
          const embed = embedConstructor('evalFailed', { reason: 'You are not the bot owner!', code: `${codeHighlighted}` });
          try {
            await interaction.reply({ embeds: [embed] });
          } catch (e) {
            if (debug) { log('cmdErr', { event: 'Eval', content: 'Interaction reply failed! Trying fallback reply method 1' }); };
            try {
              await interaction.followUp({ embeds: [embed] });
            } catch (e) {
              if (debug) { log('cmdErr', { event: 'Eval', content: 'Interaction reply failed! Trying fallback reply method 2' }); };
              await interaction.channel.send({ embeds: [embed] });
            }
          }
          if (debug) { log('genWarn', { event: 'Eval', content: `${executor.tag} tried to execute Eval but failed`, cause: 'User is not bot owner.' }); };
          return;

        } else {

          // defer
          interaction.deferReply();

          // set embed
          if (debug) { log('genLog', { event: 'Commands > Eval', content: `Embed construction` }); };
          if (code.length > 1020) {
            if (debug) { log('genLog', { event: 'Commands > Eval', content: `Code too long, resort to placeholder` }); };
            embed = embedConstructor('evalSuccess', { code: `Too long to display\n(${code.length} characters)` });
          } else {
            embed = embedConstructor('evalSuccess', { code: `${codeHighlighted}` });
          };

          // execute
          let errObj;
          if (interaction.options.getBoolean('async')) {
            try { await eval(`try { let i = interaction; async function evaluation() { ${code} }; evaluation(); } catch (e) { errObj = e; }`); } catch (e) { errObj = e };
          } else {
            try { await eval(`try { let i = interaction; ${code} } catch (e) { errObj = e; }`); } catch (e) { errObj = e; };
          }

          if (errObj) {
            // set embed
            if (debug) { log('cmdErr', { event: 'Eval', content: `Command failed, constructing failed embed` }); };
            if (code.length > 1020) {
              if (debug) { log('cmdErr', { event: 'Eval', content: `Code too long, resort to placeholder` }); };
              embed = embedConstructor('evalFailed', { reason: errObj.message, code: `Too long to display\n(${code.length} characters)` });
            } else {
              embed = embedConstructor('evalFailed', { reason: errObj.message, code: `${codeHighlighted}` });
            };

            // reply
            if (debug) { log('cmdErr', { event: 'Eval', content: `Reply with failed embed` }); };
            try {
              await interaction.editReply({ embeds: [embed], ephemeral: true });
            } catch (e) {
              if (debug) { log('cmdErr', { event: 'Eval', content: 'Interaction reply failed! Trying fallback reply method 1' }); };
              try {
                await interaction.followUp({ embeds: [embed], ephemeral: true });
              } catch (e) {
                if (debug) { log('cmdErr', { event: 'Eval', content: 'Interaction reply failed! Trying fallback reply method 2' }); };
                await interaction.channel.send({ embeds: [embed], ephemeral: true });
              }
            }

            // throw
            if (debug) { log('runtimeErr', { event: 'Eval', errName: errObj.name, content: errObj.message, extra: [`Code: ${code}`] }) };
            return;

          } else {

            // reply
            if (debug) { log('genLog', { event: 'Commands > Eval', content: `Reply with success embed` }); };

            try {
              await interaction.editReply({ embeds: [embed] });
            } catch (e) {
              if (debug) { log('cmdErr', { event: 'Eval', content: 'Interaction reply failed! Trying fallback reply method 1' }); };
              try {
                await interaction.followUp({ embeds: [embed] });
              } catch (e) {
                if (debug) { log('cmdErr', { event: 'Eval', content: 'Interaction reply failed! Trying fallback reply method 2' }); };
                await interaction.channel.send({ embeds: [embed] });
              }
            }

            // log success
            log('genLog', { event: 'Commands > Eval', content: `Evaluated code.`, extra: [`Code: ${code}`] });

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