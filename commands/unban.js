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
const { Permissions, GuildMember, Role, GuildMemberRoleManager, Guild, GuildBanManager, Collection } = require('discord.js')

// custom modules
const { embedConstructor } = require('../lib/embeds.js');
const { log } = require('../lib/logging.js');

// data
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
        var target = {};
        var reason;
        var bannedUser;

        // constants
        const executor = { obj: interaction.member, tag: interaction.user.tag, guild: interaction.guild };

        if (debug) { log('genLog', { event: 'Commands > Unban', content: `Command initialized by ${executor.tag}` }); };

        // get reason
        if (!interaction.options.getString('reason')) {
          reason = `No reason provided - Executor: ${executor.tag}`;
        } else {
          reason = interaction.options.getString('reason');
        };
        if (debug) { log('genLog', { event: 'Commands > Unban', content: `Unban reason set to \"${reason}\" by ${executor.tag}` }); };

        // user not in server
        if (!interaction.options.getMember('target')) {

          let userCache = interaction.options.getUser('target');

          // set target
          target = { obj: userCache, tag: userCache.tag, id: userCache.id };

          if (debug) { log('genLog', { event: 'Commands > Unban', content: `Unban target set to ${target.tag} by ${executor.tag}` }); };

          // attempt to find target in banned members list 
          await executor.guild.bans.fetch({ cache: false }).then((value) => {
            bannedUser = value.get(target.id);
          });

          // pull an error if cannot find user
           if (!bannedUser) {

            // reply
            const embed = embedConstructor("unbanFailed", { who: `${target.tag}`, reason: `${target.tag} is not banned.` });
              await interaction.reply({ embeds: [embed] });
              if (debug) { log('genWarn', { event: 'Unban', content: `${executor.tag} tried to unban ${target.tag} but failed`, cause: 'Target is not banned' }); };
              return;
           };

        // pull an error if user is in guild (member is not banned)
        } else if (interaction.options.getMember('target')) {

          let userCache = interaction.options.getMember('target');

          // set target
          target = { obj: userCache, tag: userCache.user.tag };
          if (debug) { log('genLog', { event: 'Commands > Unban', content: `Unban target set to ${target.tag} by ${executor.tag}` }); };

          // reply
          const embed = embedConstructor("unbanFailed", { who: `${target.tag}`, reason: `${target.tag} is not banned.` });
          await interaction.reply({ embeds: [embed] });
          if (debug) { log('genWarn', { event: 'Unban', content: `${executor.tag} tried to unban ${target.tag} but failed`, cause: 'Target is not banned'}); };
          return;
        };

        // perm checking

        // executor no ban perm
        if (!interaction.memberPermissions.has([Permissions.FLAGS.BAN_MEMBERS])) {

            // reply
            const embed = embedConstructor("unbanFailed", { who: `${target.tag}`, reason: 'You do not have permission to unban members!' });
            await interaction.reply({ embeds: [embed] });
            if (debug) { log('genWarn', { event: 'Unban', content: `${executor.tag} tried to unban ${target.tag} but failed`, cause: 'Executor did not have the Ban Members permission.'}); };
            return;
        };

        // bot no ban perm
        if (!executor.guild.me.permissions.has([Permissions.FLAGS.BAN_MEMBERS])) {

            // reply
            const embed = embedConstructor("unbanFailed", { who: `${target.tag}`, reason: 'The bot does not have permission to unban members!' });
            await interaction.reply({ embeds: [embed] });
            if (debug) { log('genWarn', { event: 'Unban', content: `${executor.tag} tried to unban ${target.tag} but failed`, cause: 'The bot does not have the Ban Members permission.' }); };
            return;
        };

        // attempt to unban member
        try { 
          if (debug) { log('genLog', { event: 'Commands > Unban', content: `Attempting to unban ${target.tag}` }); };
          executor.guild.bans.remove(target.obj, reason); 
          if (debug) { log('genLog', { event: 'Commands > Unban', content: `Successfully unbanned ${target.tag}` }); };
          
          // on success
          const successEmbed = embedConstructor("unbanSuccess", { who: `${target.tag}`, reason: `${reason}` });
          if (debug) { log('genLog', { event: 'Commands > Unban', content: `Replying with success embed` }); };
          await interaction.reply({ embeds: [successEmbed] });
          if (debug) { log('genLog', { event: 'Commands > Unban', content: `${executor.tag} unbanned ${target.tag}`, extra: [`With reason: ${reason}`] }); };

        } catch (error) { 

          log('cmdErr', { event: 'Unban', content: `Failed to unban ${target.tag}` });
          // reply
          if (debug) { errorEmbed = embedConstructor("error", { error: `${error}` }) } else { errorEmbed = embedConstructor("errorNoDebug", {}) };
          log('cmdErr', { event: 'Unban', content: `Replying with failed embed` });
          await interaction.reply({ embeds: [errorEmbed] }); 
          log('runtimeErr', { errName: error.name, event: 'Unban', content: error.message });
        };

        // cooldown management
        cooldown.add(interaction.user.id);
        setTimeout(() => { cooldown.delete(interaction.user.id); }, cooldownTime); }
  },
  documentation: {
    name: 'unban',
    category: 'Moderation',
    description: 'Unban a person from the Discord server.',
    syntax: '/unban target:[User] reason:[StringOptional]',
    cooldown: `${Math.round(cooldownTime / 1000)} seconds`,
    arguments: [
      { name: 'target', targetValue: 'User [ID]', description: 'Target user to unban' },
      { name: 'reason', targetValue: 'String [Optional]', description: 'Reason why you unbanned this user' }
    ]
  }
}
