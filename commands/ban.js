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
const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, GuildMember, Role, GuildMemberRoleManager, Guild, GuildBanManager, MessageButton, MessageActionRow } = require('discord.js');

// custom modules
const { embedConstructor } = require('../lib/embeds.js');
const { log } = require('../lib/logging.js');

// data
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
        var target = {};
        var reason;

        // constants
        const executor = { obj: interaction.member, tag: interaction.user.tag, id: interaction.user.id, guild: interaction.guild };
        const botUser = executor.guild.me;

        if (debug) { log('genLog', { event: 'Commands > Ban', content: `Command initialized by ${executor.tag}` }); };

        // ui
        const buttonRow = new MessageActionRow().addComponents( 
          new MessageButton().setLabel('Yes').setCustomId('yesBan').setStyle('SUCCESS').setEmoji('986186601417822228'), 
          new MessageButton().setLabel('No').setCustomId('noBan').setStyle('DANGER').setEmoji('986186598444056617'),
        );

        // get reason
        if (!interaction.options.getString('reason')) {
          reason = `No reason given - Executor: ${executor.tag}`;
        } else {
          reason = `${interaction.options.getString('reason')} - Executor: ${executor.tag}`;
        };
        if (debug) { log('genLog', { event: 'Commands > Ban', content: `Ban reason set to \"${reason}\" by ${executor.tag}` }); };

        // user not in server
        if (!interaction.options.getMember('target')) {

          let userCache = interaction.options.getUser('target');

          // set target
          target = { obj: userCache, tag: userCache.tag, id: userCache.id, member: false };
          if (debug) { log('genLog', { event: 'Commands > Ban', content: `Ban target set to ${target.tag} by ${executor.tag}`, extra: ['Target is outside server'] }); };

          await executor.guild.bans.fetch({ cache: false }).then((value) => {
            bannedUser = value.get(target.id);
          });

          // pull an error if user is already banned
           if (bannedUser) {

            // throw
            let embed = embedConstructor("banFailed", { who: `${target.tag}`, reason: `${target.tag} is already banned!` });
            await interaction.reply({ embeds: [embed] });
            if (debug) { log('genWarn', { event: 'Ban', content: `${executor.tag} tried to ban ${target.tag} but failed`, cause: 'Target is already banned' }); };
            return;

           };

        // user in server
        } else if (interaction.options.getMember('target')) {

          let userCache = interaction.options.getMember('target');

          // set target
          target = { obj: userCache, tag: userCache.user.tag, id: userCache.user.id, member: true }; 
          if (debug) { log('genLog', { event: 'Commands > Ban', content: `Ban target set to ${target.tag} by ${executor.tag}`, extra: ['Target is inside server'] }); };
        
        }

        // check target id

        // target is bot
        if (target.id == botID) {

          // set embed
          const embed = embedConstructor('banFailed', { who: `${target.tag}`, reason: 'You cannot ban the bot itself!' });

          // throw
          if (debug) { log('genWarn', { event: 'Ban', content: `${executor.tag} tried to ban the bot.`}); };
          if (debug) { log('genWarn', { event: 'Ban', content: 'Sending error embed' }); };
          await interaction.reply({ embeds: [embed] });
          return;

        };

        // executor checking
        if (target.id == executor.id) {

          // set embed
          let embed = embedConstructor('banFailed', { who: `${target.tag}`, reason: 'You cannot ban yourself!' });

          // throw
          if (debug) { log('genWarn', { event: 'Ban', content: `${executor.tag} tried to ban themselves.`}); };
          if (debug) { log('genWarn', { event: 'Ban', content: 'Sending error embed' }); };
          await interaction.reply({ embeds: [embed] });
          return;

        };

        // role pos checking part 1

        // member check
        if (target.member) {
          // bot lower than target
          if (botUser.roles.highest.comparePositionTo(target.obj.roles.highest) < 0) {
              
            // set embed
            let embed = embedConstructor('banFailed', { who: `${target.tag}`, reason: `The bot\'s highest role (${botUser.roles.highest}) is lower than the target\'s highest role (${target.obj.roles.highest})` });

            // throw
            if (debug) { log('genWarn', { event: 'Ban', content: `${executor.tag} tried to ban ${target.tag} but failed`, cause: 'The bot\'s highest role is lower than the target\'s.'}); };
            if (debug) { log('genWarn', { event: 'Ban', content: 'Sending error embed' }); };
            await interaction.reply({ embeds: [embed] });
            return;

          // bot equal target
          } else if (botUser.roles.highest.comparePositionTo(target.obj.roles.highest) == 0) {

            // set embed
            let embed = embedConstructor('banFailed', { who: `${target.tag}`, reason: `The bot\'s highest role is equal to the target\'s highest role (${target.obj.roles.highest})` });

            // throw
            if (debug) { log('genWarn', { event: 'Ban', content: `${executor.tag} tried to ban ${target.tag} but failed`, cause: 'The bot\'s highest role is equal to the target\'s.'}); };
            if (debug) { log('genWarn', { event: 'Ban', content: 'Sending error embed' }); };
            await interaction.reply({ embeds: [embed] });
            return;

          };
        };

        // bot no ban perm
        if (!botUser.permissions.has([Permissions.FLAGS.BAN_MEMBERS])) {

          // set embed
          let embed = embedConstructor('banFailed', { who: `${target.tag}`, reason: 'The bot does not have the permission to ban members.' });

          // throw
          if (debug) { log('genWarn', { event: 'Ban', content: `${executor.tag} tried to ban ${target.tag} but failed`, cause: 'Bot did not have the Ban Members permission.' }); };
          if (debug) { log('genWarn', { event: 'Ban', content: 'Sending error embed' }); };
          await interaction.reply({ embeds: [embed] });
          return;

        };

        // user is owner check
        if (!executor.id == executor.guild.ownerId) {

          // role pos checking part 2

          // member check
          if (target.member) {
            // executor lower than target
            if (executor.obj.roles.highest.comparePositionTo(target.obj.roles.highest) < 0) {
              
              // set embed
              let embed = embedConstructor('banFailed', { who: `${target.tag}`, reason: `Your highest role (${executor.obj.roles.highest}) is lower than target\'s highest role (${target.obj.roles.highest})` });

              // throw
              await interaction.reply({ embeds: [embed] });
              if (debug) { log('genWarn', { event: 'Ban', content: `${executor.tag} tried to ban ${target.tag} but failed`, cause: 'Executor\'s highest role was lower than the target\'s.'}); };
              return;

            // executor equal target
            } else if (executor.obj.roles.highest.comparePositionTo(target.obj.roles.highest) == 0) {

              // set embed
              let embed = embedConstructor('banFailed', { who: `${target.tag}`, reason: `Your highest role is equal to the target\'s highest role (${target.obj.roles.highest})` });

              // throw
              await interaction.reply({ embeds: [embed] });
              if (debug) { log('genWarn', { event: 'Ban', content: `${executor.tag} tried to ban ${target.tag} but failed`, cause: 'Executor\'s role was lower than the target\'s.'}); };
              return;

            };
          };

          // perm check

          // executor no ban perm
          if (!interaction.memberPermissions.has([Permissions.FLAGS.BAN_MEMBERS])) {

            // set embed
            let embed = embedConstructor('banFailed', { who: `${target.tag}`, reason: 'You do not have the permission to ban members.' });

            // throw
            if (debug) { log('genWarn', { event: 'Ban', content: `${executor.tag} tried to ban ${target.tag} but failed`, cause: 'Executor did not have the Ban Members permission.' }); };
            if (debug) { log('genWarn', { event: 'Ban', content: 'Sending error embed' }); };
            await interaction.reply({ embeds: [embed] });
            return;

          };

        };

        // construct confirm embed
        let confirmationEmbed = embedConstructor('banConfirmation', { who: `${target.tag}` });

        // send confirm
        await interaction.reply({ embeds: [confirmationEmbed], components: [buttonRow] });
        if (debug) { log('genLog', { event: 'Commands > Ban', content: `Confirmation embed was spawned due to ${executor.tag}\'s request` }); };

        // collector
        const filter = i => i.customId === 'yesBan' || i.customId === 'noBan';
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });
        if (debug) { log('genLog', { event: 'Commands > Ban', content: `Component collector initialized` }); };

        collector.on('collect', async i => {
          if (i.user.id === executor.id) {
            if (i.customId === 'yesBan') {
              await i.deferUpdate();
              if (debug) { log('genLog', { event: 'Commands > Ban', content: `${executor.tag} proceeded with banning ${target.tag}` }); };

              // create ban then edit with success embed
              await executor.guild.bans.create(target.obj, {reason});
              if (debug) { log('genLog', { event: 'Commands > Ban', content: `${executor.tag} banned ${target.tag}`, extra: [`With reason: ${reason}`] }); };
              let successEmbed = embedConstructor('banSuccess', { who: `${target.tag}`, reason: `${reason}` });

              if (debug) { log('genLog', { event: 'Commands > Ban', content: `Ban embed updated with success embed` }); };
              await i.editReply({ embeds: [successEmbed], components: [] });

              // kills the collector
              if (debug) { log('genLog', { event: 'Commands > Ban', content: `Component collector was killed` }); };
              collector.stop();

            } else if (i.customId === 'noBan') {
              await i.deferUpdate();
              if (debug) { log('genLog', { event: 'Commands > Ban', content: `${executor.tag} cancelled banning ${target.tag}` }); };

              // edit with cancelled embed
              let cancelledEmbed = embedConstructor('banCancel', { who: `${target.tag}` });
              if (debug) { log('genLog', { event: 'Commands > Ban', content: `Ban embed updated with cancelled embed` }); };
              await i.editReply({ embeds: [cancelledEmbed], components: [] });

              // kills the collector
              if (debug) { log('genLog', { event: 'Commands > Ban', content: `Component collector was killed` }); };
              collector.stop();

            }

          } else {

            // different member tries to answer? block
            if (debug) { log('genWarn', { event: 'Ban', content: `Other user tried to use a confirmation embed that did not belong to them` }); };
            let notForUserEmbed = embedConstructor('notForUser', {});
            if (debug) { log('genWarn', { event: 'Ban', content: 'Sending error embed' }); };
            await i.reply({ embeds: [notForUserEmbed], ephemeral: true });
            
          };

        });

        // cooldown management
        cooldown.add(executor.id);
        setTimeout(() => { cooldown.delete(executor.id); }, cooldownTime);
        
        }
    },
  documentation: {
    name: 'ban',
    category: 'Moderation',
    description: 'Ban a person from the Discord server.',
    syntax: '/ban target:[User] reason:[StringOptional]',
    cooldown: `${Math.round(cooldownTime / 1000)} seconds`,
    arguments: [
      { name: 'target', targetValue: 'User', description: 'Target user to ban.' },
      { name: 'reason', targetValue: 'String [Optional]', description: 'Reason why you banned this user.' }
    ]
  }
}