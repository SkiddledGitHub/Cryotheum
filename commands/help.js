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
 * You should have received a copy of the GNU General Public License along with Foobar. 
 * If not, see <https://www.gnu.org/licenses/>.
 *
 */

// modules
const { SlashCommandBuilder } = require('@discordjs/builders');
const { embedConstructor } = require('../lib/embeds.js');
const { log } = require('../lib/logging.js');
const { debug } = require('../config.json');
const fs = require('node:fs');

// set cooldown
const cooldown = new Set();
const cooldownTime = 2000;
const cooldownEmbed = embedConstructor("cooldown", { cooldown: '2 seconds' });

module.exports = {
  data: new SlashCommandBuilder()
  .setName('help')
  .setDescription('Basic bot documentation command.')
  .addStringOption((option) => option.setName('command').setDescription('Command to show documentation for').setRequired(false)),
  async execute(interaction) {
    // cooldown management
    if (cooldown.has(interaction.user.id)) {
    await interaction.reply({ embeds: [cooldownEmbed] });
      } else {

        const executor = { obj: interaction.member, tag: interaction.user.tag };

        if (debug) { log('genLog', { event: 'Commands > Help', content: `Command initialized by ${executor.tag}` }); };

        if (!interaction.options.getString('command')) {
          if (debug) { log('genLog', { event: 'Commands > Help', content: `User provided no command to display documentation, displaying command list` }); };
          let commandList = [];
          let commandCategories = [];

          if (debug) { log('genLog', { event: 'Commands > Help', content: `Parsing command list data` }); };

          interaction.client.commands.forEach((value, key) => {
            if (value.documentation.name) {
              if (value.documentation.category) {
                commandList.push({ name: value.documentation.name, category: value.documentation.category });
              } else {
                commandList.push({ name: value.documentation.name, category: 'Uncategorized' });
              };
            };
          });

          if (debug) { log('genLog', { event: 'Commands > Help', content: `Parsed command list data:` }); console.log(commandList); };
          if (debug) { log('genLog', { event: 'Commands > Help', content: `Parsing command categories` }); };

          interaction.client.commands.forEach((value, key) => {
            if (value.documentation.category) {
              if (!commandCategories.includes(value.documentation.category)) {
                commandCategories.push(value.documentation.category);
              };
            };
          });

          if (debug) { log('genLog', { event: 'Commands > Help', content: `Parsed command categories:` }); console.log(commandCategories); };
          if (debug) { log('genLog', { event: 'Commands > Help', content: `Embed construction` }); };

          let embed = embedConstructor('helpList', { list: commandList, categories: commandCategories });

          if (debug) { log('genLog', { event: 'Commands > Help', content: `Replying with commands list` }); };

          await interaction.deferReply();
          await interaction.editReply({ embeds: [embed] });
        } else if (interaction.options.getString('command')) {
          let inputCommandName = interaction.options.getString('command').toLowerCase();

          if (debug) { log('genLog', { event: 'Commands > Help', content: `User provided command name: ${inputCommandName}` }); };
          if (debug) { log('genLog', { event: 'Commands > Help', content: `Looking up command documentation` }); };

          let commandObject = interaction.client.commands.find(d => d.documentation.name.toLowerCase() === inputCommandName);
          let docsObject = undefined;
          if (commandObject) {
            docsObject = commandObject.documentation;
          };

          if (!docsObject) {
            if (debug) { log('cmdErr', { event: 'Help', content: `Could not find documentation data, assuming command name is invalid` }); };
            if (debug) { log('cmdErr', { event: 'Help', content: `Embed construction` }); };

            let embed = embedConstructor('helpGetFailed', { reason: 'Inputted command name is invalid!' });

            if (debug) { log('cmdErr', { event: 'Help', content: `Replying with failed embed` }); };

            await interaction.deferReply();
            await interaction.editReply({ embeds: [embed] });
          } else if (docsObject) {
            if (debug) { log('genLog', { event: 'Commands > Help', content: `Documentation data found` }); };
            if (debug) { log('genLog', { event: 'Commands > Help', content: `Embed construction` }); };

            let embed = embedConstructor('helpGetSuccess', { documentation: docsObject, type: 'Command' });

            if (debug) { log('genLog', { event: 'Commands > Help', content: `Replying with command documentation` }); };

            await interaction.deferReply();
            await interaction.editReply({ embeds: [embed] });
          };
        }

        // cooldown management
      	cooldown.add(interaction.user.id);
        setTimeout(() => { cooldown.delete(interaction.user.id); }, cooldownTime);

      }
  },
  documentation: {
    name: 'help',
    category: 'Information',
    description: 'Basic bot documentation command.',
    syntax: '/help command:[StringOptional]',
    cooldown: `${Math.round(cooldownTime / 1000)} seconds`,
    arguments: [
      { name: 'command', targetValue: 'String [Optional]', description: 'The command to display documentation for.' }
    ]
  }
}
