// modules
const { SlashCommandBuilder } = require('@discordjs/builders');
const { embedCreator } = require('../tools/embeds.js');

// set cooldown
const cooldown = new Set();
const cooldownTime = 4000;
const cooldownEmbed = embedCreator("cooldown", { cooldown: '4 seconds' });

module.exports = {
  data: new SlashCommandBuilder()
  	.setName('avatar')
  	.setDescription('Get avatar from a Discord user.')	
		.addUserOption((option) => option.setName('target').setDescription('The target user to get the avatar from').setRequired(true)),
	async execute(interaction) {

		const executor = interaction.member.user.tag;
    const target = interaction.options.getUser('target');
    const avatarEmbed = embedCreator("avatar", { who: `${target.tag}`, image: `${target.displayAvatarURL({ dynamic: true, size: 1024 })}` })
    try {
    	if (cooldown.has(interaction.user.id)) {
      	await interaction.reply({ 
          	embeds: [cooldownEmbed]
        });
    	} else {
    		
      	await interaction.reply({ 
        	embeds: [avatarEmbed]
      	});
      	console.log(` \x1b[1;32m=>\x1b[1;37m ${executor} executed avatar command: \n\x1b[0m\x1b[35m  -> \x1b[37mTarget is ${target.tag}`);
      	// add user to cooldown
      	cooldown.add(interaction.user.id);
        	setTimeout(() => {
          	// rm cooldown after it has passed
          	cooldown.delete(interaction.user.id);
        	}, cooldownTime);
      	}
    	} catch (error) {
        var errorEmbed = embedCreator("error", { error: `${error}` });
      	await interaction.reply({
      			embeds: [errorEmbed],
      			ephemeral: true
      	})
      	console.error(` \x1b[1;31m=> ERROR: \x1b[1;37m${error}`);
    	}
	},
}