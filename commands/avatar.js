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
   	};
    if (interaction.options.getMember('target') != null) {
      target = interaction.options.getMember('target');
    };
    if (interaction.options.getMember('target') == null && interaction.options.getUser('target') != null) {
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
      	log('genLog', `${executor} executed avatar command: \n\x1b[0m\x1b[35m  -> \x1b[37mTarget is ${target.tag}`);
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