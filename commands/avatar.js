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
const { embedCreator } = require('../tools/embeds.js');
const { debug } = require('../config.json');
const { log } = require('../tools/loggingUtil.js');

// set cooldown
const cooldown = new Set();
const cooldownTime = 4000;
const cooldownEmbed = embedCreator("cooldown", { cooldown: '4 seconds' });

module.exports = {
  data: new SlashCommandBuilder()
  	.setName('avatar')
  	.setDescription('Get avatar from a Discord user.')	
		.addUserOption((option) => option.setName('target').setDescription('The target user to get the avatar from')),
	async execute(interaction) {
		const executor = interaction.member.user;
		// get target 
		if (interaction.options.getMember('target') == null && interaction.options.getUser('target') == null) {
      target = executor;
   	} else if (interaction.options.getMember('target') != null) {
      target = interaction.options.getMember('target');
    } else if (interaction.options.getMember('target') == null && interaction.options.getUser('target') != null) {
    	target = interaction.options.getUser('target')
    };
    const avatarEmbed = embedCreator("avatar", { who: `${target.tag}`, image: `${target.displayAvatarURL({ dynamic: true, size: 1024 })}` })
    	if (cooldown.has(interaction.user.id)) {
      	await interaction.reply({ 
          	embeds: [cooldownEmbed]
        });
    	} else {
    		
      	await interaction.reply({ 
        	embeds: [avatarEmbed]
      	});
      	if (debug) {
      	log('genLog', `${executor.tag} executed avatar command: \n\x1b[0m\x1b[35m  -> \x1b[37mTarget is ${target.tag}`);
      	};
      	// add user to cooldown
      	cooldown.add(interaction.user.id);
        	setTimeout(() => {
          	// rm cooldown after it has passed
          	cooldown.delete(interaction.user.id);
        	}, cooldownTime);
      	}
  }
}
