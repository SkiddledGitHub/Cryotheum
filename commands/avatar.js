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
const { embedConstructor, log } = require('../tools/cryoLib.js');
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

    // set executor
		const executor = interaction.member;
    const executorTag = executor.user.tag;

    // variables
    var target;
    var targetTag;

    if (debug) { log('genLog', { event: 'Commands > Avatar', content: `Command initialized by ${executorTag}` }); };

		// set target
    // no target provided
		if (!interaction.options.getUser('target') && !interaction.options.getMember('target')) {

      // set executor as target
      target = executor;
      targetTag = target.user.tag;

      // if target is in server
    } else if (interaction.options.getUser('target') && interaction.options.getMember('target')) {

      // set target
      target = interaction.options.getMember('target');
      targetTag = target.user.tag;
    
      // if target is outside server
    } else if (interaction.options.getUser('target') && !interaction.options.getMember('target')) {

      // set target
      target = interaction.options.getUser('target');
      targetTag = target.tag;

    };

    if (debug) { log('genLog', { event: 'Commands > Avatar', content: `Target set to ${targetTag}` }); };

    // create embed object
    if (debug) { log('genLog', { event: 'Commands > Avatar', content: `Constructing embed` }); };
    const avatarEmbed = embedConstructor("avatar", { who: `${targetTag}`, image: `${target.displayAvatarURL({ dynamic: true, size: 1024 })}` })
    	// cooldown management
      if (cooldown.has(interaction.user.id)) {
      await interaction.reply({ embeds: [cooldownEmbed] });
    	} else {
    		
        // reply
        if (debug) { log('genLog', { event: 'Commands > Avatar', content: `Replying with embed` }); };
      	await interaction.reply({ embeds: [avatarEmbed] });
      	if (debug) { if (debug) { log('genLog', { event: 'Commands > Avatar', content: `Avatar command succeeded.`, extra: `Target is ${targetTag}` }); }; };

      	// cooldown management
      	cooldown.add(interaction.user.id);
        setTimeout(() => { cooldown.delete(interaction.user.id); }, cooldownTime);
      	
        }
    }
}
