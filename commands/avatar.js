const { SlashCommandBuilder } = require('@discordjs/builders');

const cooldown = new Set();
const cooldownTime = 3000;

module.exports = {
  data: new SlashCommandBuilder()
  	.setName('avatar')
  	.setDescription('Get avatar from a Discord user.')	
	.addUserOption((option) => option.setName('target').setDescription('The target user to get the avatar from').setRequired(true)),
	async execute(interaction) {
		const executor = interaction.member.user.tag;
    	const target = interaction.options.getUser('target');
    	const avatarEmbed = {
      		color: '#42B983',
      		title: `${target.tag}\'s avatar`,
      		image: {
        		url: `${target.displayAvatarURL({ dynamic: true, size: 1024 })}`,
      		},
  		};
    	try {
    	if (cooldown.has(interaction.user.id)) {
      		await interaction.reply({ 
          		content: `You are under cooldown! (Default cooldown is 3s)`, 
          		ephemeral: true 
        	});
    	} else {
      	await interaction.reply({ 
        	embeds: [avatarEmbed]
      	});
      	console.log(`\x1b[1;32m==>\x1b[1;37m ${executor} executed avatar command: \n\x1b[0m\x1b[35m -> \x1b[37mTarget is ${target.tag}`);
      	// add user to cooldown
      	cooldown.add(interaction.user.id);
        	setTimeout(() => {
          	// rm cooldown after it has passed
          	cooldown.delete(interaction.user.id);
        	}, cooldownTime);
      	}
    	} catch (error) {
      	await interaction.reply({
        	content: `An error occurred: ${error}`,
        	ephemeral: true
      	})
      	console.error(`\x1b[1;31m==> ERROR: \x1b[1;37m${error}`);
    	}
	},
}