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
const { debug, botOwner } = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
  	.setName('eval')
  	.setDescription('Evaluate JS code. Restricted to bot owner (for obvious reasons)')
  	.addStringOption((option) => option.setName('code').setDescription('Code to evaluate').setRequired(true)),
  async execute(interaction) {

      // constants
      const executor = interaction.member;
      const executorTag = executor.user.tag;
      const code = interaction.options.getString('code');
      const codeHighlighted = codeBlock('js', code);

      // variables
      var embed;

      if (debug) { log('genLog', { event: 'Commands > Eval', content: `Command initialized by ${executorTag}` }); };

        // if user is not bot owner, pull error
      	if (executor.user.id != botOwner) {

          // set embed & reply & log fail
          const embed = embedConstructor('evalFailed', { reason: 'You are not the bot owner!', code: `${codeHighlighted}` });
          await interaction.reply({ embeds: [embed] });
          if (debug) { log('genWarn', { event: 'Eval', content: `${executorTag} tried to execute Eval but failed`, cause: 'User is not bot owner.' }); };
          return;

        } else {

          // try catch for eval errors
          try { 

            // set embed
            if (debug) { log('genLog', { event: 'Commands > Eval', content: `Embed construction` }); };
            if (code.length > 1020) {
              if (debug) { log('genLog', { event: 'Commands > Eval', content: `Code too long, resort to placeholder` }); };
              embed = embedConstructor('evalSuccess', { code: `Too long to display\n(${code.length} characters)` });
            } else {
              embed = embedConstructor('evalSuccess', { code: `${codeHighlighted}` });
            };

            // execute
            let output = eval(code);

            // reply
            if (debug) { log('genLog', { event: 'Commands > Eval', content: `Reply with success embed` }); };
            await interaction.reply({ embeds: [embed] }); 

          } catch (error) { 

            // set embed
            if (debug) { log('cmdErr', { event: 'Eval', content: `Command failed, constructing failed embed` }); };
            if (code.length > 1020) {
              if (debug) { log('cmdErr', { event: 'Eval', content: `Code too long, resort to placeholder` }); };
              embed = embedConstructor('evalFailed', { reason: `${error}`, code: `Too long to display\n(${code.length} characters)` });
            } else {
              embed = embedConstructor('evalFailed', { reason: `${error}`, code: `${codeHighlighted}` });
            };

            // reply
            if (debug) { log('cmdErr', { event: 'Eval', content: `Reply with failed embed` }); };
            await interaction.reply({ embeds: [embed], ephemeral: true }); 

            // throw
            if (debug) { log('runtimeErr', { event: 'Eval', errName: `${error.name}`, content: `${error.message}`, extra: `Code: ${code}` }) };
            return;

          };

          // log success
          log('genLog', { event: 'Commands > Eval', content: `Evaluated code.`, extra: `Code: ${code}` });
        }
  	},
}