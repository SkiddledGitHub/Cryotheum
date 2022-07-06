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
const { embedConstructor } = require('../lib/embeds.js');
const { log } = require ('../lib/logging.js');
const { debug } = require('../config.json');

// set cooldown
const cooldown = new Set();
const cooldownTime = 4000;
const cooldownEmbed = embedConstructor("cooldown", { cooldown: '4 seconds' });

module.exports = {
  data: new SlashCommandBuilder()
  	.setName('avatar')
  	.setDescription('Get avatar from a Discord user.')	
		.addUserOption((option) => option.setName('target').setDescription('The target user to get the avatar from')),
	async execute(interaction) {
    	// cooldown management
      if (cooldown.has(interaction.user.id)) {
      await interaction.reply({ embeds: [cooldownEmbed] });
    	} else {

        // set executor
        const executor = { obj: interaction.member, tag: interaction.member.user.tag };

        // variables
        let target = {};

        if (debug) { log('genLog', { event: 'Commands > Avatar', content: `Command initialized by ${executor.tag}` }); };

      // set target
      // no target provided
      if (!interaction.options.getUser('target') && !interaction.options.getMember('target')) {

        // set executor as target
        target.obj = executor.obj;
        target.tag = target.obj.user.tag;
	      if (target.obj.avatar) {
		      target.avatarHash = target.obj.avatar;
	      } else {
		      target.avatarHash = target.obj.user.avatar;
	      };

      // if target is in server
      } else if (interaction.options.getUser('target') && interaction.options.getMember('target')) {

        // set target
        target.obj = interaction.options.getMember('target');
        target.tag = target.obj.user.tag;
	      if (target.obj.avatar) {
		      target.avatarHash = target.obj.avatar;
	      } else {
		      target.avatarHash = target.obj.user.avatar;
	      };
    
      // if target is outside server
      } else if (interaction.options.getUser('target') && !interaction.options.getMember('target')) {

        // set target
        target.obj = interaction.options.getUser('target');
        target.tag = target.obj.tag;
        target.avatarHash = target.obj.avatar;

      };

      if (debug) { log('genLog', { event: 'Commands > Avatar', content: `Target set to ${target.tag}` }); };

      // create embed object
      if (debug) { log('genLog', { event: 'Commands > Avatar', content: `Constructing embed` }); };
      let embed;

      if (target.avatarHash.slice(0,2) == 'a_') {
        embed = embedConstructor("avatar", { who: `${target.tag}`, image: `${target.obj.displayAvatarURL({ format: 'gif', dynamic: true, size: 1024 })}` });
      } else {
        embed = embedConstructor("avatar", { who: `${target.tag}`, image: `${target.obj.displayAvatarURL({ dynamic: true, size: 1024 })}` });
      }
    		
      // reply
      if (debug) { log('genLog', { event: 'Commands > Avatar', content: `Replying with embed` }); };
      await interaction.reply({ embeds: [embed] });
      if (debug) { if (debug) { log('genLog', { event: 'Commands > Avatar', content: `Avatar command succeeded.`, extra: [`Target is ${target.tag}`] }); }; };

      // cooldown management
      cooldown.add(interaction.user.id);
      setTimeout(() => { cooldown.delete(interaction.user.id); }, cooldownTime);
      	
      }
    },
  documentation: {
    name: 'avatar',
    category: 'Information',
    description: 'Get avatar from a Discord user.',
    syntax: '/avatar target:[UserOptional]',
    cooldown: `${Math.round(cooldownTime / 1000)} seconds`,
    arguments: [
      { name: 'target', targetValue: 'User [Optional]', description: 'The target user to get the avatar from.' }
    ]
  }
}
