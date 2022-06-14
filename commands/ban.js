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
 * You should have received a copy of the GNU General Public License along with the Cryotheum source code. 
 * If not, see <https://www.gnu.org/licenses/>.
 *
 */

// modules
const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, GuildMember, Role, GuildMemberRoleManager, Guild, GuildBanManager, MessageButton, MessageActionRow } = require('discord.js');
const { embedConstructor, log } = require('../tools/cryoLib.js');
const { debug } = require('../config.json');

// set cooldown
const cooldown = new Set();
const cooldownTime = 6000;
const cooldownEmbed = embedConstructor("cooldown", { cooldown: '6 seconds' });

module.exports = {
  data: new SlashCommandBuilder()
  .setName('ban')
  .setDescription('Ban a person from the Discord server.')
  .addUserOption((option) => option.setName('target').setDescription('Target user to ban').setRequired(true))
  .addStringOption((option) => option.setName('reason').setDescription('Reason why you banned this user').setRequired(false)),
  async execute(interaction) {
      // cooldown management
      if (cooldown.has(interaction.user.id)) {
      await interaction.reply({ embeds: [cooldownEmbed] });
      } else {

        // variables
        var target;
        var targetTag;
        var targetID;
        var reason;

        // constants
        const executor = interaction.member;
        const executorTag = executor.user.tag;
        const executorID = executor.user.id;
        const executorGuild = executor.guild;
        const botUser = executorGuild.me;

        // ui
        const buttonRow = new MessageActionRow().addComponents( 
          new MessageButton().setLabel('Yes').setCustomId('yesBan').setStyle('SUCCESS'), 
          new MessageButton().setLabel('No').setCustomId('noBan').setStyle('DANGER'),
        );

        // get reason
        if (!interaction.options.getString('reason')) {
          reason = `No reason given - Executor: ${executorTag}`
        } else {
          reason = `${interaction.options.getString('reason')} - Executor: ${executorTag}`
        };

        // user not in server
        if (!interaction.options.getMember('target')) {

            // set target
            target = interaction.options.getUser('target');
            targetTag = target.tag;
            targetID = target.id;

          await executor.guild.bans.fetch({ cache: false }).then((value) => {
            bannedUser = value.get(targetID);
          });

          // pull an error if cannot find user
           if (bannedUser) {

            // throw
            let embed = embedConstructor("banFailed", { who: `${targetTag}`, reason: `${targetTag} is already banned!` });
            await interaction.reply({ embeds: [embed] });
            if (debug) { log('genWarn', { content: `${executorTag} tried to ban ${targetTag} but failed`, cause: 'Target is already banned' }); };
            return;

           };

        // user in server
        } else if (interaction.options.getMember('target')) {

            // set target
            target = interaction.options.getMember('target');   
            targetTag = target.user.tag;
            targetID = target.user.id;

        };

        // check target id

        // if equal bot, pull error
        if (targetID == "413250765629423636") {

          // set embed
          const embed = embedConstructor('banFailed', { who: `${targetTag}`, reason: 'You cannot ban the bot itself.' });

          // throw
          await interaction.reply({ embeds: [embed] });
          if (debug) { log('genWarn', { content: `${executorTag} tried to ban the bot.`}); };
          return;

        };

        // executor checking
        if (targetID == executorID) {

          // set embed
          let embed = embedConstructor('banFailed', { who: `${targetTag}`, reason: 'You cannot ban yourself!' });

          // throw
          await interaction.reply({ embeds: [embed] });
          if (debug) { log('genWarn', { content: `${executorTag} tried to ban themselves.`}); };
          return;

        };

        // user is owner check
        if (executorID == executorGuild.ownerId) {

          // role pos checking
            
          // bot lower than target
          if (botUser.roles.highest.comparePositionTo(target.roles.highest) < 0) {
              
            // set embed
            let embed = embedConstructor('banFailed', { who: `${targetTag}`, reason: `The bot\'s highest role (${botUser.roles.highest}) is lower than the target\'s highest role (${target.roles.highest})` });

            // throw
            await interaction.reply({ embeds: [embed] });
            if (debug) { log('genWarn', { content: `${executorTag} tried to ban ${targetTag} but failed`, cause: 'The bot\'s highest role is lower than the target\'s.'}); };
            return;

          // bot equal target
          } else if (botUser.roles.highest.comparePositionTo(target.roles.highest) == 0) {

            // set embed
            let embed = embedConstructor('banFailed', { who: `${targetTag}`, reason: `The bot\'s highest role is equal to the target\'s highest role (${target.roles.highest})` });

            // throw
            await interaction.reply({ embeds: [embed] });
            if (debug) { log('genWarn', { content: `${executorTag} tried to ban ${targetTag} but failed`, cause: 'The bot\'s highest role is equal to the target\'s.'}); };
            return;

          };

          // executor lower than target
          if (executor.roles.highest.comparePositionTo(target.roles.highest) < 0) {
              
            // set embed
            let embed = embedConstructor('banFailed', { who: `${targetTag}`, reason: `Your highest role (${executor.roles.highest}) is lower than target\'s highest role (${target.roles.highest})` });

            // throw
            await interaction.reply({ embeds: [embed] });
            if (debug) { log('genWarn', { content: `${executorTag} tried to ban ${targetTag} but failed`, cause: 'Executor\'s highest role was lower than the target\'s.'}); };
            return;

          // executor equal target
          } else if (executor.roles.highest.comparePositionTo(target.roles.highest) == 0) {

            // set embed
            let embed = embedConstructor('banFailed', { who: `${targetTag}`, reason: `Your highest role is equal to the target\'s highest role (${target.roles.highest})` });

            // throw
            await interaction.reply({ embeds: [embed] });
            if (debug) { log('genWarn', { content: `${executorTag} tried to ban ${targetTag} but failed`, cause: 'Executor\'s role was lower than the target\'s.'}); };
            return;

          };

          // perm check

          // executor no ban perm
          if (!interaction.memberPermissions.has([Permissions.FLAGS.BAN_MEMBERS])) {

            // set embed
            let embed = embedConstructor('banFailed', { who: `${targetTag}`, reason: 'You do not have the permission to ban members.' });

            // throw
            await interaction.reply({ embeds: [embed] });

            if (debug) { log('genWarn', `${executorTag} tried to ban ${targetTag} but failed: \n\x1b[0m\x1b[35m  -> \x1b[37mExecutor did not have the Ban Members permission.`); };
            return;

          };

          // bot no ban perm
          if (!botUser.permissions.has([Permissions.FLAGS.BAN_MEMBERS])) {

            // set embed
            let embed = embedConstructor('banFailed', { who: `${targetTag}`, reason: 'The bot does not have the permission to ban members.' });

            // throw
            await interaction.reply({ embeds: [embed] });

            if (debug) { log('genWarn', `${executorTag} tried to ban ${targetTag} but failed: \n\x1b[0m\x1b[35m  -> \x1b[37mBot did not have the Ban Members permission.`); };
            return;
          };

        };

        // construct confirm embed
        let confirmationEmbed = embedConstructor('banConfirmation', { who: `${targetTag}` });

        // send confirm
        await interaction.reply({ embeds: [confirmationEmbed], components: [buttonRow] });

        // collector
        const filter = i => i.customId === 'yesBan' || i.customId === 'noBan';
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async i => {
          if (i.user.id === executorID) {
            if (i.customId === 'yesBan') {

              // create ban then edit with success embed
              await executorGuild.bans.create(target, {reason});
              let successEmbed = embedConstructor('banSuccess', { who: `${targetTag}`, reason: `${reason}` });
              await i.update({ embeds: [successEmbed], components: [] });

            } else if (i.customId === 'noBan') {

              // edit with cancelled embed
              let cancelledEmbed = embedConstructor('banCancel', { who: `${targetTag}` });
              await i.update({ embeds: [cancelledEmbed], components: [] });

            }

          } else {

            // different member tries to answer? block
            let notForUserEmbed = embedConstructor('banFailedNFU', {});
            await i.reply({ embeds: [notForUserEmbed], ephemeral: true });

          };

          // kills the collector
          collector.stop();
        
        });

        if (debug) { log('genLog', `${executorTag} banned ${targetTag}:\n\x1b[0m\x1b[35m  -> \x1b[37mWith reason: ${reason}`); };

        // cooldown management
        cooldown.add(executorID);
        setTimeout(() => { cooldown.delete(executorID); }, cooldownTime);
        
        }
    }
}