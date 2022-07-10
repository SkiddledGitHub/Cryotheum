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
const { SlashCommandBuilder, codeBlock, time } = require('@discordjs/builders');
const { Permissions } = require('discord.js');

// 3rd party modules
const decache = require('decache');
const emojis = require('node-emoji');

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
  .setName('userinfo')
  .setDescription('Get user profile from a Discord user')
  .addUserOption((option) => option.setName('target').setDescription('User to get user information from')),
  async execute(interaction) {
      // cooldown management
      if (cooldown.has(interaction.user.id)) {
      await interaction.reply({ embeds: [cooldownEmbed] });
      } else {

      	// constants
      	const executor = { obj: interaction.member, tag: interaction.user.tag, id: interaction.user.id };

      	// define target
      	var target = {};

      	// define date variables
      	var joinedAt;
      	var createdAt;

      	// define other variables
        var embed;
        var sBadges = "";
        var iBadges = "";

        if (debug) { log('genLog', { event: 'Commands > User Info', content: `Command initialized by ${executor.tag}` }); };

      	// if option is blank, get executor's data instead
      	if (!interaction.options.getMember('target') && !interaction.options.getUser('target')) {
      	  
      		// assign target as executor
      		target = { obj: executor.obj, tag: executor.tag, id: codeBlock('yaml', `ID: ${executor.id}`), member: true };

          // force fetch
          target.obj.fetch();

          // avatar determination
          if (target.obj.avatar) {
            if (target.obj.avatar.slice(0,2) == 'a_') {
              target.avatar = target.obj.displayAvatarURL({ format: 'gif', dynamic: true, size: 1024 });
            } else {
              target.avatar = target.obj.displayAvatarURL({ dynamic: true, size: 1024 });
            };
          } else {
            if (target.obj.user.avatar.slice(0,2) == 'a_') {
              target.avatar = target.obj.displayAvatarURL({ format: 'gif', dynamic: true, size: 1024 });
            } else {
              target.avatar = target.obj.displayAvatarURL({ dynamic: true, size: 1024 });
            };
          };

      		// get target's roles
      		target.roles = target.obj.roles.cache.map(r => r).toString().replace(/,/g, ' ');

      		// get target's guild join and account creation date
          	joinedAt = { full: `${time(target.obj.joinedAt, 'f')}`, mini: `${time(target.obj.joinedAt, 'R')}` };
            createdAt = { full: `${time(target.obj.user.createdAt, 'f')}`, mini: `${time(target.obj.user.createdAt, 'R')}` };
      	
      	};

      	// if target is guild member
      	if (interaction.options.getMember('target')) {

          let userCache = interaction.options.getMember('target');

      		// assigning target
      		target = { obj: userCache, tag: userCache.user.tag, id: codeBlock('yaml', `ID: ${userCache.user.id}`), member: true };

          // force fetch
          target.obj.fetch();

          // avatar determination
          if (target.obj.avatar) {
            if (target.obj.avatar.slice(0,2) == 'a_') {
              target.avatar = target.obj.displayAvatarURL({ format: 'gif', dynamic: true, size: 1024 });
            } else {
              target.avatar = target.obj.displayAvatarURL({ dynamic: true, size: 1024 });
            };
          } else {
            if (target.obj.user.avatar.slice(0,2) == 'a_') {
              target.avatar = target.obj.displayAvatarURL({ format: 'gif', dynamic: true, size: 1024 });
            } else {
              target.avatar = target.obj.displayAvatarURL({ dynamic: true, size: 1024 });
            };
          };

      		// get target's roles
      		target.roles = target.obj.roles.cache.map(r => r).toString().replace(/,/g, ' ');

      		// get target's guild join and account creation date
          	joinedAt = { full: `${time(target.obj.joinedAt, 'f')}`, mini: `${time(target.obj.joinedAt, 'R')}` };
            createdAt = { full: `${time(target.obj.user.createdAt, 'f')}`, mini: `${time(target.obj.user.createdAt, 'R')}` };

      	};

      	// if member is not guild member
      	if (!interaction.options.getMember('target') && interaction.options.getUser('target')) {
      	
          let userCache = interaction.options.getUser('target');

      		// assigning target
          target = { obj: userCache, tag: userCache.tag, id: codeBlock('yaml', `ID: ${userCache.id}`), member: false };

          // force fetch
          target.obj.fetch();

          // avatar determination
          if (target.obj.avatar.slice(0,2) == 'a_') {
            target.avatar = target.obj.displayAvatarURL({ format: 'gif', dynamic: true, size: 1024 });
          } else {
            target.avatar = target.obj.displayAvatarURL({ dynamic: true, size: 1024 });
          };

          if (target.obj.banner) {
            target.banner = target.obj.bannerURL({ extension: 'png', size: 1024 });
          };

      		// get target's account creation date
            createdAt = { full: `${time(target.obj.createdAt, 'f')}`, mini: `${time(target.obj.createdAt, 'R')}` };

      	};

        if (debug) { log('genLog', { event: 'Commands > User Info', content: `Target set to ${target.tag}` }); };

      	// assign special emojis to certain users
        function specialBadgesParsing() {
          let { specialBadges } = require('../config.json');
          sBadges = specialBadges[target.obj.id];
          decache('../config.json');
          if (!sBadges) { sBadges = ''; return; };
        };
        specialBadgesParsing();
        if (debug) { log('genLog', { event: 'Commands > User Info', content: `Parsed special badges from target` }); };

        function insightBadgesParsing() {
          let isOwner = false;
          let isAdmin = false;
            if (!target.member) {
            if (target.obj.bot) {
              iBadges += `<:bot:965220811424288789>.`;
            };
          } else {
            if (target.obj.user.bot) {
              iBadges += `<:bot:965220811424288789>.`;
            };
             if (target.obj.id == interaction.guild.ownerId) {
              iBadges += `<:guildOwner:965220811638202378>.`
              isOwner = true;
            };
            if (interaction.guild.members.cache.get(target.obj.id).permissions.has([Permissions.FLAGS.ADMINISTRATOR]) && !isOwner) {
              iBadges += `<:guildAdmin:965220811248107550>.`
              isAdmin = true;
            };
            if (interaction.guild.members.cache.get(target.obj.id).permissions.has([Permissions.FLAGS.MANAGE_MESSAGES]) && !isOwner && !isAdmin) {
              iBadges += `<:guildModerator:965220811571093545>.`
            };
          };
          iBadges = iBadges.replace(/\./g, ' ');
          iBadges = iBadges.replace(/ $/g, '');
          if (iBadges == '') { return; };
        };
        insightBadgesParsing();

        if (debug) { log('genLog', { event: 'Commands > User Info', content: `Parsed insight badges` }); };
        if (debug) { log('genLog', { event: 'Commands > User Info', content: `Constructing embed` }); };

      	if (!target.member) {
      	 embed = embedConstructor('userinfoSuccess', { guildMember: `${target.member}`, who: `${target.obj}`, whoTag: `${target.tag}`, idBlock: `${target.id}`, createdAt: {full: `${createdAt.full}`, mini: `${createdAt.mini}`}, sBadges: `${sBadges}`, iBadges: `${iBadges}`, avatar: `${target.avatar}` });
      	} else {
      	 embed = embedConstructor('userinfoSuccess', { guildMember: `${target.member}`, who: `${target.obj}`, whoTag: `${target.tag}`, idBlock: `${target.id}`, roles: `${target.roles}`, joinedAt: {full: `${joinedAt.full}`, mini: `${joinedAt.mini}`}, createdAt: {full: `${createdAt.full}`, mini: `${createdAt.mini}`}, sBadges: `${sBadges}`, iBadges: `${iBadges}`, avatar: `${target.avatar}` });
      	};

        if (debug) { log('genLog', { event: 'Commands > User Info', content: `Replying with embed` }); };
      	await interaction.reply({ embeds: [embed] });

      	// cooldown management
        cooldown.add(interaction.user.id);
        setTimeout(() => { cooldown.delete(interaction.user.id); }, cooldownTime);

      	}
    },
  documentation: {
    name: 'userinfo',
    category: 'Information',
    description: 'Get user profile from a Discord user',
    syntax: '/userinfo target:[UserOptional]',
    cooldown: `${Math.round(cooldownTime / 1000)} seconds`,
    arguments: [
      { name: 'target', targetValue: 'User [Optional]', description: 'User to get user information on' }
    ]
  }
}
