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
const { SlashCommandBuilder, codeBlock, time } = require('@discordjs/builders');
const { Permissions } = require('discord.js');
const { embedConstructor } = require('../lib/embeds.js');
const { log } = require('../lib/logging.js');
const decache = require('decache');
const { debug } = require('../config.json');
const emojis = require('node-emoji');

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
      	const executor = interaction.member;
	      const executorTag = executor.user.tag;

      	// define target variables
      	var target;
      	var targetTag;
      	var targetID;
        var targetBannerImage;

      	// define date variables
      	var joinedAt;
      	var createdAt;

      	// define guild member data variables
      	var roles;

      	// define other variables
      	var embed;
      	var isGuildMember;
        var sBadges = "";
        var iBadges = "";

        if (debug) { log('genLog', { event: 'Commands > User Info', content: `Command initialized by ${executorTag}` }); };

      	// if option is blank, get executor's data instead
      	if (!interaction.options.getMember('target') && !interaction.options.getUser('target')) {
      	  
      		// assign target as executor
      		target = executor;
      		targetTag = target.user.tag;
          targetID = codeBlock('yaml', `ID: ${target.id}`);
          isGuildMember = true;

          // force fetch
          target.fetch();

      		// get target's roles
      		roles = target.roles.cache.map(r => r).toString().replace(/,/g, ' ');

      		// get target's guild join and account creation date
          	joinedAt = { full: `${time(target.joinedAt, 'f')}`, mini: `${time(target.joinedAt, 'R')}` };
            createdAt = { full: `${time(target.user.createdAt, 'f')}`, mini: `${time(target.user.createdAt, 'R')}` };
      	
      	};

      	// if target is guild member
      	if (interaction.options.getMember('target')) {

      		// assigning target
      		target = interaction.options.getMember('target');
      		targetTag = target.user.tag;
      		targetID = codeBlock('yaml', `ID: ${target.id}`);
      		isGuildMember = true;

          // force fetch
          target.fetch();

      		// get target's roles
      		roles = target.roles.cache.map(r => r).toString().replace(/,/g, ' ');

      		// get target's guild join and account creation date
          	joinedAt = { full: `${time(target.joinedAt, 'f')}`, mini: `${time(target.joinedAt, 'R')}` };
            createdAt = { full: `${time(target.user.createdAt, 'f')}`, mini: `${time(target.user.createdAt, 'R')}` };

      	};

      	// if member is not guild member
      	if (!interaction.options.getMember('target') && interaction.options.getUser('target')) {
      	
      		// assigning target
      		target = interaction.options.getUser('target');
      		targetTag = target.tag;
      		targetID = codeBlock('yaml', `ID: ${target.id}`);
      		isGuildMember = false;

          // force fetch
          target.fetch();

          if (target.banner != undefined) {
            targetBannerImage = target.bannerURL({ extension: 'png', size: 1024 });
          }

      		// get target's account creation date
            createdAt = { full: `${time(target.createdAt, 'f')}`, mini: `${time(target.createdAt, 'R')}` };

      	};

        if (debug) { log('genLog', { event: 'Commands > User Info', content: `Target set to ${targetTag}` }); };

      	// assign special emojis to certain users
        function specialBadgesParsing() {
          let { specialBadges } = require('../config.json');
          sBadges = specialBadges[target.id];
          decache('../config.json');
          if (sBadges == undefined) { sBadges = ''; return; };
        };
        specialBadgesParsing();
        if (debug) { log('genLog', { event: 'Commands > User Info', content: `Parsed special badges from target` }); };

        function insightBadgesParsing() {
          var isOwner = false;
          var isAdmin = false;
            if (!isGuildMember) {
            if (target.bot) {
              iBadges += `<:bot:965220811424288789>.`;
            };
          } else {
            if (target.user.bot) {
              iBadges += `<:bot:965220811424288789>.`;
            };
             if (target.id == interaction.guild.ownerId) {
              iBadges += `<:guildOwner:965220811638202378>.`
              isOwner = true;
            };
            if (interaction.guild.members.cache.get(target.id).permissions.has([Permissions.FLAGS.ADMINISTRATOR]) && !isOwner) {
              iBadges += `<:guildAdmin:965220811248107550>.`
              isAdmin = true;
            };
            if (interaction.guild.members.cache.get(target.id).permissions.has([Permissions.FLAGS.MANAGE_MESSAGES]) && !isOwner && !isAdmin) {
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
      	if (!isGuildMember) {
      	embed = embedConstructor('userinfoSuccess', { guildMember: `${isGuildMember}`, who: `${target}`, whoTag: `${targetTag}`, idBlock: `${targetID}`, createdAt: {full: `${createdAt.full}`, mini: `${createdAt.mini}`}, sBadges: `${sBadges}`, iBadges: `${iBadges}`, avatar: `${target.displayAvatarURL({ dynamic: true, size: 1024 })}` });
      	} else {
      	embed = embedConstructor('userinfoSuccess', { guildMember: `${isGuildMember}`, who: `${target}`, whoTag: `${targetTag}`, idBlock: `${targetID}`, roles: `${roles}`, joinedAt: {full: `${joinedAt.full}`, mini: `${joinedAt.mini}`}, createdAt: {full: `${createdAt.full}`, mini: `${createdAt.mini}`}, sBadges: `${sBadges}`, iBadges: `${iBadges}`, avatar: `${target.displayAvatarURL({ dynamic: true, size: 1024 })}` });
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
