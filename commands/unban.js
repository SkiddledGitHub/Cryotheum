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
const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, GuildMember, Role, GuildMemberRoleManager, Guild, GuildBanManager, Collection } = require('discord.js')
const { embedConstructor, log } = require('../lib/cryoLib.js');
const { debug } = require('../config.json');

// set cooldown
const cooldown = new Set();
const cooldownTime = 6000;
const cooldownEmbed = embedConstructor("cooldown", { cooldown: '6 seconds' });

module.exports = {
  data: new SlashCommandBuilder()
  .setName('unban')
  .setDescription('Unban a person from the Discord server.')
  .addUserOption((option) => option.setName('target').setDescription('Target user to unban').setRequired(true))
  .addStringOption((option) => option.setName('reason').setDescription('Reason why you unbanned this user').setRequired(false)),
  async execute(interaction) {
      // cooldown management
      if (cooldown.has(interaction.user.id)) {
      await interaction.reply({ embeds: [cooldownEmbed] });
      } else {

        // variables
        var target;
        var targetID;
        var targetTag;
        var reason;
        var bannedUser;

        // constants
        const executor = interaction.member;
        const executorTag = executor.user.tag;

        if (debug) { log('genLog', { event: 'Commands > Unban', content: `Command initialized by ${executorTag}` }); };

        // get reason
        if (!interaction.options.getString('reason')) {
          reason = `No reason provided - Executor: ${executorTag}`;
        } else {
          reason = interaction.options.getString('reason');
        };
        if (debug) { log('genLog', { event: 'Commands > Unban', content: `Unban reason set to \"${reason}\" by ${executorTag}` }); };

        // user not in server
        if (!interaction.options.getMember('target')) {

            // set target
            target = interaction.options.getUser('target');
            targetID = target.id;
            targetTag = target.tag;

            if (debug) { log('genLog', { event: 'Commands > Unban', content: `Unban target set to ${targetTag} by ${executorTag}` }); };

          // attempt to find target in banned members list 
          await executor.guild.bans.fetch({ cache: false }).then((value) => {
            bannedUser = value.get(targetID);
          });

          // pull an error if cannot find user
           if (!bannedUser) {

            // reply
            const embed = embedConstructor("unbanFailed", { who: `${targetTag}`, reason: `${targetTag} is not banned.` });
              await interaction.reply({ embeds: [embed] });
              if (debug) { log('genWarn', { event: 'Unban', content: `${executorTag} tried to unban ${targetTag} but failed`, cause: 'Target is not banned' }); };
              return;
           };

        // pull an error if user is in guild (member is not banned)
        } else if (interaction.options.getMember('target')) {

            // set target
            target = interaction.options.getUser('target');
            targetTag = target.tag;
            if (debug) { log('genLog', { event: 'Commands > Unban', content: `Unban target set to ${targetTag} by ${executorTag}` }); };

            // reply
            const embed = embedConstructor("unbanFailed", { who: `${targetTag}`, reason: `${targetTag} is not banned.` });
            await interaction.reply({ embeds: [embed] });
            if (debug) { log('genWarn', { event: 'Unban', content: `${executorTag} tried to unban ${targetTag} but failed`, cause: 'Target is not banned'}); };
            return;
          };

        // perm checking

        // executor no ban perm
        if (!interaction.memberPermissions.has([Permissions.FLAGS.BAN_MEMBERS])) {

            // reply
            const embed = embedConstructor("unbanFailed", { who: `${targetTag}`, reason: 'You do not have permission to unban members!' });
            await interaction.reply({ embeds: [embed] });
            if (debug) { log('genWarn', { event: 'Unban', content: `${executorTag} tried to unban ${targetTag} but failed`, cause: 'Executor did not have the Ban Members permission.'}); };
            return;
        };

        // bot no ban perm
        if (!executor.guild.me.permissions.has([Permissions.FLAGS.BAN_MEMBERS])) {

            // reply
            const embed = embedConstructor("unbanFailed", { who: `${targetTag}`, reason: 'The bot does not have permission to unban members!' });
            await interaction.reply({ embeds: [embed] });
            if (debug) { log('genWarn', { event: 'Unban', content: `${executorTag} tried to unban ${targetTag} but failed`, cause: 'The bot does not have the Ban Members permission.' }); };
            return;
        };

        // attempt to unban member
        try { 
          if (debug) { log('genLog', { event: 'Commands > Unban', content: `Attempting to unban ${targetTag}` }); };
          executor.guild.bans.remove(target, reason); 
          if (debug) { log('genLog', { event: 'Commands > Unban', content: `Successfully unbanned ${targetTag}` }); };
          
          // on success
          const successEmbed = embedConstructor("unbanSuccess", { who: `${targetTag}`, reason: `${reason}` });
          if (debug) { log('genLog', { event: 'Commands > Unban', content: `Replying with success embed` }); };
          await interaction.reply({ embeds: [successEmbed] });
          if (debug) { log('genLog', { event: 'Commands > Unban', content: `${executorTag} unbanned ${targetTag}`, extra: `With reason: ${reason}` }); };

        } catch (error) { 

          log('cmdErr', { event: 'Unban', content: `Failed to unban ${targetTag}` });
          // reply
          if (debug) { errorEmbed = embedConstructor("error", { error: `${error}` }) } else { errorEmbed = embedConstructor("errorNoDebug", {}) };
          log('cmdErr', { event: 'Unban', content: `Replying with failed embed` });
          await interaction.reply({ embeds: [errorEmbed] }); 
          log('runtimeErr', { errName: error.name, event: 'Unban', content: error.message });
        };

        cooldown.add(interaction.user.id);
          setTimeout(() => {
            // rm cooldown after it has passed
            cooldown.delete(interaction.user.id);
          }, cooldownTime);
        }
  }
}
