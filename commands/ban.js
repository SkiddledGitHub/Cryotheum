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
const { embedConstructor, log } = require('../lib/cryoLib.js');
const { debug, botID } = require('../config.json');

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

        if (debug) { log('genLog', { event: 'Commands > Ban', content: `Command initialized by ${executorTag}` }); };

        // ui
        const buttonRow = new MessageActionRow().addComponents( 
          new MessageButton().setLabel('Yes').setCustomId('yesBan').setStyle('SUCCESS'), 
          new MessageButton().setLabel('No').setCustomId('noBan').setStyle('DANGER'),
        );

        // get reason
        if (!interaction.options.getString('reason')) {
          reason = `No reason given - Executor: ${executorTag}`;
        } else {
          reason = `${interaction.options.getString('reason')} - Executor: ${executorTag}`;
        };
        if (debug) { log('genLog', { event: 'Commands > Ban', content: `Ban reason set to \"${reason}\" by ${executorTag}` }); };

        // user not in server
        if (!interaction.options.getMember('target')) {

            // set target
            target = interaction.options.getUser('target');
            targetTag = target.tag;
            targetID = target.id;
            if (debug) { log('genLog', { event: 'Commands > Ban', content: `Ban target set to ${targetTag} by ${executorTag}`, extra: 'Target is outside server' }); };

          await executor.guild.bans.fetch({ cache: false }).then((value) => {
            bannedUser = value.get(targetID);
          });

          // pull an error if user is already banned
           if (bannedUser) {

            // throw
            let embed = embedConstructor("banFailed", { who: `${targetTag}`, reason: `${targetTag} is already banned!` });
            await interaction.reply({ embeds: [embed] });
            if (debug) { log('genWarn', { event: 'Ban', content: `${executorTag} tried to ban ${targetTag} but failed`, cause: 'Target is already banned' }); };
            return;

           };

        // user in server
        } else if (interaction.options.getMember('target')) {

            // set target
            target = interaction.options.getMember('target');   
            targetTag = target.user.tag;
            targetID = target.user.id;
            if (debug) { log('genLog', { event: 'Commands > Ban', content: `Ban target set to ${targetTag} by ${executorTag}`, extra: 'Target is inside server' }); };

        };

        // check target id

        // if equal bot, pull error
        if (targetID == botID) {

          // set embed
          const embed = embedConstructor('banFailed', { who: `${targetTag}`, reason: 'You cannot ban the bot itself.' });

          // throw
          await interaction.reply({ embeds: [embed] });
          if (debug) { log('genWarn', { event: 'Ban', content: `${executorTag} tried to ban the bot.`}); };
          return;

        };

        // executor checking
        if (targetID == executorID) {

          // set embed
          let embed = embedConstructor('banFailed', { who: `${targetTag}`, reason: 'You cannot ban yourself!' });

          // throw
          await interaction.reply({ embeds: [embed] });
          if (debug) { log('genWarn', { event: 'Ban', content: `${executorTag} tried to ban themselves.`}); };
          return;

        };

        // user is owner check
        if (!executorID == executorGuild.ownerId) {

          // role pos checking
            
          // bot lower than target
          if (botUser.roles.highest.comparePositionTo(target.roles.highest) < 0) {
              
            // set embed
            let embed = embedConstructor('banFailed', { who: `${targetTag}`, reason: `The bot\'s highest role (${botUser.roles.highest}) is lower than the target\'s highest role (${target.roles.highest})` });

            // throw
            await interaction.reply({ embeds: [embed] });
            if (debug) { log('genWarn', { event: 'Ban', content: `${executorTag} tried to ban ${targetTag} but failed`, cause: 'The bot\'s highest role is lower than the target\'s.'}); };
            return;

          // bot equal target
          } else if (botUser.roles.highest.comparePositionTo(target.roles.highest) == 0) {

            // set embed
            let embed = embedConstructor('banFailed', { who: `${targetTag}`, reason: `The bot\'s highest role is equal to the target\'s highest role (${target.roles.highest})` });

            // throw
            await interaction.reply({ embeds: [embed] });
            if (debug) { log('genWarn', { event: 'Ban', content: `${executorTag} tried to ban ${targetTag} but failed`, cause: 'The bot\'s highest role is equal to the target\'s.'}); };
            return;

          };

          // executor lower than target
          if (executor.roles.highest.comparePositionTo(target.roles.highest) < 0) {
              
            // set embed
            let embed = embedConstructor('banFailed', { who: `${targetTag}`, reason: `Your highest role (${executor.roles.highest}) is lower than target\'s highest role (${target.roles.highest})` });

            // throw
            await interaction.reply({ embeds: [embed] });
            if (debug) { log('genWarn', { event: 'Ban', content: `${executorTag} tried to ban ${targetTag} but failed`, cause: 'Executor\'s highest role was lower than the target\'s.'}); };
            return;

          // executor equal target
          } else if (executor.roles.highest.comparePositionTo(target.roles.highest) == 0) {

            // set embed
            let embed = embedConstructor('banFailed', { who: `${targetTag}`, reason: `Your highest role is equal to the target\'s highest role (${target.roles.highest})` });

            // throw
            await interaction.reply({ embeds: [embed] });
            if (debug) { log('genWarn', { event: 'Ban', content: `${executorTag} tried to ban ${targetTag} but failed`, cause: 'Executor\'s role was lower than the target\'s.'}); };
            return;

          };

          // perm check

          // executor no ban perm
          if (!interaction.memberPermissions.has([Permissions.FLAGS.BAN_MEMBERS])) {

            // set embed
            let embed = embedConstructor('banFailed', { who: `${targetTag}`, reason: 'You do not have the permission to ban members.' });

            // throw
            await interaction.reply({ embeds: [embed] });

            if (debug) { log('genWarn', { event: 'Ban', content: `${executorTag} tried to ban ${targetTag} but failed`, cause: 'Executor did not have the Ban Members permission.' }); };
            return;

          };

          // bot no ban perm
          if (!botUser.permissions.has([Permissions.FLAGS.BAN_MEMBERS])) {

            // set embed
            let embed = embedConstructor('banFailed', { who: `${targetTag}`, reason: 'The bot does not have the permission to ban members.' });

            // throw
            await interaction.reply({ embeds: [embed] });

            if (debug) { log('genWarn', { event: 'Ban', content: `${executorTag} tried to ban ${targetTag} but failed`, cause: 'Bot did not have the Ban Members permission.' }); };
            return;
          };

        };

        // construct confirm embed
        let confirmationEmbed = embedConstructor('banConfirmation', { who: `${targetTag}` });

        // send confirm
        await interaction.reply({ embeds: [confirmationEmbed], components: [buttonRow] });
        if (debug) { log('genLog', { event: 'Commands > Ban', content: `Confirmation embed was spawned due to ${executorTag}\'s request` }); };

        // collector
        const filter = i => i.customId === 'yesBan' || i.customId === 'noBan';
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });
        if (debug) { log('genLog', { event: 'Commands > Ban', content: `Component collector initialized` }); };

        collector.on('collect', async i => {
          if (i.user.id === executorID) {
            if (i.customId === 'yesBan') {
              if (debug) { log('genLog', { event: 'Commands > Ban', content: `${executorTag} proceeded with banning ${targetTag}` }); };

              // create ban then edit with success embed
              await executorGuild.bans.create(target, {reason});
              if (debug) { log('genLog', { event: 'Commands > Ban', content: `${executorTag} banned ${targetTag}`, extra: `With reason: ${reason}` }); };
              let successEmbed = embedConstructor('banSuccess', { who: `${targetTag}`, reason: `${reason}` });

              if (debug) { log('genLog', { event: 'Commands > Ban', content: `Ban embed updated with success embed` }); };
              await i.update({ embeds: [successEmbed], components: [] });

            } else if (i.customId === 'noBan') {
              if (debug) { log('genLog', { event: 'Commands > Ban', content: `${executorTag} cancelled banning ${targetTag}` }); };

              // edit with cancelled embed
              let cancelledEmbed = embedConstructor('banCancel', { who: `${targetTag}` });
              if (debug) { log('genLog', { event: 'Commands > Ban', content: `Ban embed updated with cancelled embed` }); };
              await i.update({ embeds: [cancelledEmbed], components: [] });

            }

          } else {

            // different member tries to answer? block
            let notForUserEmbed = embedConstructor('banFailedNFU', {});
            await i.reply({ embeds: [notForUserEmbed], ephemeral: true });
            if (debug) { log('genWarn', { event: 'Ban', content: `Other user tried to use a confirmation embed that did not belong to them` }); };

          };

          // kills the collector
          if (debug) { log('genLog', { event: 'Commands > Ban', content: `Component collector was killed` }); };
          collector.stop();
        
        });

        // cooldown management
        cooldown.add(executorID);
        setTimeout(() => { cooldown.delete(executorID); }, cooldownTime);
        
        }
    }
}