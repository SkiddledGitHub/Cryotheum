/**
 * Copyright 2022 SkiddledGitHub (Discord: Skiddled#0802)
 * This program is distributed under the terms of the GNU General Public License.
 */

// modules
const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, GuildMember, Role, GuildMemberRoleManager, Guild, GuildBanManager,MessageButton, MessageActionRow } = require('discord.js')
const { embedCreator } = require('../tools/embeds.js');
const { debug } = require('../config.json');
const { log } = require('../tools/loggingUtil.js');

// set cooldown
const cooldown = new Set();
const cooldownTime = 6000;
const cooldownEmbed = embedCreator("cooldown", { cooldown: '6 seconds' });

module.exports = {
  data: new SlashCommandBuilder()
  .setName('ban')
  .setDescription('Ban a person from the Discord server.')
  .addUserOption((option) => option.setName('target').setDescription('Target user to ban').setRequired(true))
  .addStringOption((option) => option.setName('reason').setDescription('Reason why you banned this user').setRequired(false)),
  async execute(interaction) {
      // call cooldown if user in cooldown list
      if (cooldown.has(interaction.user.id)) {
      await interaction.reply({ 
          embeds: [cooldownEmbed]
        });

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
        const buttonRow = new MessageActionRow().addComponents( 
                            new MessageButton().setLabel('Yes').setCustomId('yesBan').setStyle('SUCCESS'), 
                            new MessageButton().setLabel('No').setCustomId('noBan').setStyle('DANGER'),
                          );

        // get reason
        if (interaction.options.getString('reason') == null) {
          reason = `Executor: ${executorTag}`
        } else {
          reason = interaction.options.getString('reason');
        };

        // user not in server
        if (interaction.options.getMember('target') == null) {

            // set target
            target = interaction.options.getUser('target');
            targetTag = target.tag;
            targetID = target.id;

          await executor.guild.bans.fetch({ cache: false }).then((value) => {
            bannedUser = value.get(targetID);
          });

          // pull an error if cannot find user
           if (bannedUser != null) {

            // reply
            const embed = embedCreator("banFailed", { who: `${targetTag}`, reason: `${targetTag} is already banned!` });
              await interaction.reply({
                embeds: [embed]
              });
              if (debug) {
              log('genWarn', `${executorTag} tried to ban ${targetTag} but failed: \n\x1b[0m\x1b[35m  -> \x1b[37mTarget is already banned`);
              };
              return;
           };

        // user in server
        } else if (interaction.options.getMember('target') != null) {

            // set target
            target = interaction.options.getMember('target');   
            targetTag = target.user.tag;
            targetID = target.user.id;

            // check target id

            // if equal bot, pull error
            if (targetID == "413250765629423636") {

              // set embed
              const embed = embedCreator('banFailed', { who: `${targetTag}`, reason: 'You cannot ban the bot itself.' });

              // reply & log fail & return
              await interaction.reply({
                embeds: [embed]
              });
              if (debug) {
              log('genWarn', `${executorTag} tried to ban the bot.`);
              };
              return;
            };

            // if equal executor, pull error
            if (targetID == executorID) {

              // set embed
              const embed = embedCreator('banFailed', { who: `${targetTag}`, reason: 'You cannot ban yourself!' });

              // reply & log fail & return
              await interaction.reply({
                embeds: [embed]
              });
              if (debug) {
              log('genWarn', `${executorTag} tried to ban themselves.`);
              };
              return;
            };

            // if bot's highest role is lower than the target's, pull error
            if (botUser.roles.highest.comparePositionTo(target.roles.highest) < 0 || botUser.roles.highest.comparePositionTo(target.roles.highest) == 0) {
              
              // set embed
              const embed = embedCreator('banFailed', { who: `${targetTag}`, reason: 'The bot\'s highest role is lower than target\'s highest role.' });

              // reply & log fail & return
              await interaction.reply({
                embeds: [embed]
              });
              if (debug) {
              log('genWarn', `${executorTag} tried to ban ${bannedMember} but failed: \n\x1b[0m\x1b[35m  -> \x1b[37mThe bot\'s role is not higher than the target\'s.`);
              };
              return;
            };

            // if executor's highest role is lower than the target's, pull error
            if (executor.roles.highest.comparePositionTo(target.roles.highest) < 0 || executor.roles.highest.comparePositionTo(target.roles.highest) == 0) {
              
              // set embed
              const embed = embedCreator('banFailed', { who: `${targetTag}`, reason: 'Your highest role is lower than target\'s highest role.' });

              // reply & log fail & return
              await interaction.reply({
                embeds: [embed]
              });
              if (debug) {
              log('genWarn', `${executorTag} tried to ban ${bannedMember} but failed: \n\x1b[0m\x1b[35m  -> \x1b[37mExecutor\'s role was not higher than the target\'s.`);
              };
              return;
            };
          };

        // if executor does not have ban permissions, pull error
        if (!interaction.memberPermissions.has([Permissions.FLAGS.BAN_MEMBERS])) {

          // set embed
          const embed = embedCreator('banFailed', { who: `${targetTag}`, reason: 'You do not have the permission to ban members.' });

          // reply & log fail & return
          await interaction.reply({
            embeds: [embed]
          });
          if (debug) {
          log('genWarn', `${executorTag} tried to ban ${bannedMember} but failed: \n\x1b[0m\x1b[35m  -> \x1b[37mExecutor did not have the Ban Members permission.`);
          };
          return;
        };

        // if bot does not have ban permissions, pull error
        if (!botUser.permissions.has([Permissions.FLAGS.BAN_MEMBERS])) {

          // set embed
          const embed = embedCreator('banFailed', { who: `${targetTag}`, reason: 'The bot does not have the permission to ban members.' });

          // reply & log fail & return
          await interaction.reply({
            embeds: [embed]
          });
          if (debug) {
          log('genWarn', `${executorTag} tried to ban ${bannedMember} but failed: \n\x1b[0m\x1b[35m  -> \x1b[37mBot did not have the Ban Members permission.`);
          };
          return;
        };

        // attempt to ban member
        const confirmationEmbed = embedCreator('banConfirmation', { who: `${targetTag}` });
        const successEmbed = embedCreator('banSuccess', { who: `${targetTag}`, reason: `${reason}` });
        const cancelledEmbed = embedCreator('banCancel', { who: `${targetTag}` });

        await interaction.reply({
          embeds: [confirmationEmbed],
          components: [buttonRow]
        });

        const filter = i => i.customId === 'yesBan' || i.customId === 'noBan';
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async i => {
          if (i.user.id === executorID) {
            if (i.customId === 'yesBan') {
              await executorGuild.bans.create(target, {reason});
              await i.update({ embeds: [successEmbed], components: [] });
            } else if (i.customId === 'noBan') {
              await i.update({ embeds: [cancelledEmbed], components: [] });
            }
          } else {
            const notForUserEmbed = embedCreator('banFailedNFU', {});
            await i.reply({ embeds: [notForUserEmbed], ephemeral: true });
          };
          collector.stop();
        });

        if (debug) {
        log('genLog', `${executorTag} banned ${targetTag}:\n\x1b[0m\x1b[35m  -> \x1b[37mWith reason: ${reason}`);
        };

          cooldown.add(executorID);
          setTimeout(() => {
            // rm cooldown after it has passed
            cooldown.delete(executorID);
          }, cooldownTime);
        }
  }
}