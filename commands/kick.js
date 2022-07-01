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
const { Permissions, GuildMember, Role, GuildMemberRoleManager, Guild, MessageButton, MessageActionRow } = require('discord.js')
const { embedConstructor } = require('../lib/embeds.js');
const { log } = require('../lib/logging.js');
const { debug, botID } = require('../config.json');

// set cooldown
const cooldown = new Set();
const cooldownTime = 4000;
const cooldownEmbed = embedConstructor("cooldown", { cooldown: '4 seconds' });

module.exports = {
  data: new SlashCommandBuilder()
  .setName('kick')
  .setDescription('Kick a member from the Discord server')
  .addUserOption((option) => option.setName('target').setDescription('Target user to kick').setRequired(true))
  .addStringOption((option) => option.setName('reason').setDescription('Reason why you kicked this user').setRequired(false)),
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
          new MessageButton().setLabel('Yes').setCustomId('yesKick').setStyle('SUCCESS').setEmoji('986186601417822228'), 
          new MessageButton().setLabel('No').setCustomId('noKick').setStyle('DANGER').setEmoji('986186598444056617'),
        );

        if (debug) { log('genLog', { event: 'Commands > Kick', content: `Command initialized by ${executorTag}` }); };

        // get reason
        if (!interaction.options.getString('reason')) {
            reason = `No reasons given - Executor: ${executorTag}`;
        } else {
            reason = `${interaction.options.getString('reason')} - Executor: ${executorTag}`
        };
        if (debug) { log('genLog', { event: 'Commands > Kick', content: `Kick reason set to \"${reason}\" by ${executorTag}` }); };

        // user not in server
        if (!interaction.options.getMember('target')) {

          // set target
          target = interaction.options.getUser('target');
          targetTag = target.tag;

          // throw
          if (debug) { log('genWarn', { event: 'Kick', content: `${executorTag} tried to kick ${targetTag} but failed`, cause: 'Target is not in server' }); };
          let embed = embedConstructor('kickFailed', { who: targetTag, reason: 'Target is not in the server!' });
          if (debug) { log('genWarn', { event: 'Kick', content: `Sending error embed` }); };          
          interaction.reply({ embeds: [embed] });
          return;

        // user in server
        } else {

          // set target
          target = interaction.options.getMember('target');
          targetID = target.user.id;
          targetTag = target.user.tag;

        };

        log('genLog', { event: 'Commands > Kick', content: `Kick target set to ${targetTag} by ${executorTag}` });

        // target is bot
        if (targetID == botID) {

          // set embed
          let embed = embedConstructor('kickFailed', { who: targetTag, reason: 'You cannot kick the bot itself!' });

          // throw
          if (debug) { log('genWarn', { event: 'Kick', content: `${executorTag} tried to kick the bot` }); };
          if (debug) { log('genWarn', { event: 'Kick', content: `Sending error embed` }); };
          interaction.reply({ embeds: [embed] });
          return;

        }

        // target is executor
        if (targetID == executorID) {        

          // set embed
          let embed = embedConstructor('kickFailed', { who: targetTag, reason: 'You cannot kick yourself!' });

          // throw 
          if (debug) { log('genWarn', { event: 'Kick', content: `${executorTag} tried to kick themselves` }); };
          if (debug) { log('genWarn', { event: 'Kick', content: `Sending error embed` }); };
          interaction.reply({ embeds: [embed] });
          return;

        }

        // role pos checking part 1

        // bot highest role lower than target
        if (botUser.roles.highest.comparePositionTo(target.roles.highest) < 0) {

          // set embed
          let embed = embedConstructor('kickFailed', { who: targetTag, reason: `The bot\'s highest role (${botUser.roles.highest}) is lower than target\'s highest role (${target.roles.highest})` });
          
          // throw
          if (debug) { log('genWarn', { event: 'Kick', content: `${executorTag} tried to kick ${targetTag} but failed`, cause: 'The bot\'s highest role is lower than the target\'s highest role' }); };
          if (debug) { log('genWarn', { event: 'Kick', content: `Sending error embed` }); };
          await interaction.reply({ embeds: [embed] });
          return;
          
        // bot highest role equal target
        } else if (botUser.roles.highest.comparePositionTo(target.roles.highest) == 0) {

          // set embed
          let embed = embedConstructor('kickFailed', { who: targetTag, reason: `The bot\'s highest role is equal to the target\'s highest role (${botUser.roles.highest})` });

          // throw
          if (debug) { log('genWarn', { event: 'Kick', content: `${executorTag} tried to kick ${targetTag} but failed`, cause: 'The bot\'s highest role is equal to the target\'s highest role' }); };
          if (debug) { log('genWarn', { event: 'Kick', content: `Sending error embed` }); };
          await interaction.reply({ embeds: [embed] });
          return;

        };

        // bot no kick perm
        if (!botUser.permissions.has([Permissions.FLAGS.KICK_MEMBERS])) {

          // set embed
          let embed = embedConstructor('kickFailed', { who: `${targetTag}`, reason: 'The bot does not have the permission to kick members.' });

          // throw
          if (debug) { log('genWarn', { event: 'Kick', content: `${executorTag} tried to kick ${targetTag} but failed`, cause: 'Bot did not have the Kick Members permission.' }); };
          if (debug) { log('genWarn', { event: 'Kick', content: `Sending error embed` }); };
          await interaction.reply({ embeds: [embed] });
          return;

        };

        // target is not owner
        if (!executorID == executorGuild.ownerId) {

          // role pos checking part 2
          // executor lower than target
          if (executor.roles.highest.comparePositionTo(target.roles.highest) < 0) {

            // set embed
            let embed = embedConstructor('kickFailed', { who: targetTag, reason: `Your highest role is lower than the target\'s highest role (${botUser.roles.highest})` });

            // throw
            if (debug) { log('genWarn', { event: 'Kick', content: `${executorTag} tried to kick ${targetTag} but failed`, cause: 'Executor\'s highest role is lower than the target\'s highest role' }); };
            if (debug) { log('genWarn', { event: 'Kick', content: `Sending error embed` }); };
            await interaction.reply({ embeds: [embed] });
            return;   

          // executor equal to target
          } else if (executor.roles.highest.comparePositionTo(target.roles.highest) == 0) {

            // set embed
            let embed = embedConstructor('kickFailed', { who: targetTag, reason: `Your highest role is equal to the target\'s highest role (${botUser.roles.highest})` });

            // throw
            if (debug) { log('genWarn', { event: 'Kick', content: `${executorTag} tried to kick ${targetTag} but failed`, cause: 'Executor\'s highest role is equal to the target\'s highest role' }); };
            if (debug) { log('genWarn', { event: 'Kick', content: `Sending error embed` }); };
            await interaction.reply({ embeds: [embed] });
            return;

          };

          // executor no kick perm
          if (!interaction.memberPermissions.has([Permissions.FLAGS.KICK_MEMBERS])) {

            // set embed
            let embed = embedConstructor('kickFailed', { who: `${targetTag}`, reason: 'You do not have the permission to kick members.' });

            // throw
            if (debug) { log('genWarn', { event: 'Kick', content: `${executorTag} tried to kick ${targetTag} but failed`, cause: 'Executor did not have the Kick Members permission.' }); };
            if (debug) { log('genWarn', { event: 'Kick', content: `Sending error embed` }); };
            await interaction.reply({ embeds: [embed] });
            return;

          };

        };

        // construct confirm embed
        let confirmationEmbed = embedConstructor('kickConfirmation', { who: `${targetTag}` });

        // send confirm
        await interaction.reply({ embeds: [confirmationEmbed], components: [buttonRow] });
        if (debug) { log('genLog', { event: 'Commands > Kick', content: `Confirmation embed was spawned due to ${executorTag}\'s request` }); };

        // collector
        const filter = i => i.customId === 'yesKick' || i.customId === 'noKick';
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });
        if (debug) { log('genLog', { event: 'Commands > Kick', content: `Component collector initialized` }); };

        collector.on('collect', async i => {
          if (i.user.id === executorID) {
            if (i.customId === 'yesKick') {
              await i.deferUpdate();
              if (debug) { log('genLog', { event: 'Commands > Kick', content: `${executorTag} proceeded with kicking ${targetTag}` }); };

              // kick then edit with success embed
              await executorGuild.kick(target, {reason});
              if (debug) { log('genLog', { event: 'Commands > Kick', content: `${executorTag} kicked ${targetTag}`, extra: [`With reason: ${reason}`] }); };
              let successEmbed = embedConstructor('kickSuccess', { who: `${targetTag}`, reason: `${reason}` });

              if (debug) { log('genLog', { event: 'Commands > Ban', content: `Kick embed updated with success embed` }); };
              await i.editReply({ embeds: [successEmbed], components: [] });

              // kills the collector
              if (debug) { log('genLog', { event: 'Commands > Ban', content: `Component collector was killed` }); };
              collector.stop();

            } else if (i.customId === 'noKick') {
              await i.deferUpdate();
              if (debug) { log('genLog', { event: 'Commands > Ban', content: `${executorTag} cancelled kicking ${targetTag}` }); };

              // edit with cancelled embed
              let cancelledEmbed = embedConstructor('kickCancel', { who: `${targetTag}` });
              if (debug) { log('genLog', { event: 'Commands > Kick', content: `Kick embed updated with cancelled embed` }); };
              await i.editReply({ embeds: [cancelledEmbed], components: [] });

              // kills the collector
              if (debug) { log('genLog', { event: 'Commands > Ban', content: `Component collector was killed` }); };
              collector.stop();

            }

          } else {

            // different member tries to answer? block
            if (debug) { log('genWarn', { event: 'Kick', content: `Other user tried to use a confirmation embed that did not belong to them` }); };
            let notForUserEmbed = embedConstructor('kickFailedNFU', {});
            if (debug) { log('genWarn', { event: 'Kick', content: 'Sending error embed' }); };
            await i.followUp({ embeds: [notForUserEmbed], ephemeral: true });
            
          };

        });


        // cooldown management
        cooldown.add(interaction.user.id);
        setTimeout(() => { cooldown.delete(interaction.user.id); }, cooldownTime);
        
        }
    }
}
