const { SlashCommandBuilder } = require('@discordjs/builders');

const avtCooldown = new Set();
const avtCooldownTime = 3000;

module.exports = {
	data: new SlashCommandBuilder()
	.setName('experiment')
	.setDescription('infinite possibilties only limited by the mind')
	.addUserOption((option) => option.setName('target').setDescription('The target user').setRequired(true)),
	async execute(interaction) {
		const member = interaction.member.user.tag;
    	const target = interaction.options.getUser('target');
    	const avatarEmbed = {
      		color: '#42B983',
      		title: `${target.tag}\'s avatar`,
      		image: {
        		url: `${target.displayAvatarURL({ dynamic: true, size: 1024 })}`,
      		},
  		};
    	try {
    	if (avtCooldown.has(interaction.user.id)) {
      		await interaction.reply({ 
          		content: `You are under cooldown! (Default cooldown is 3s)`, 
          		ephemeral: true 
        	});
    	} else {
      	await interaction.reply({ 
        	embeds: [avatarEmbed],
        	ephemeral: true 
      	});
      	console.log(`\x1b[1;32m==>\x1b[1;37m ${member} executed avatar command: \n\x1b[0m\x1b[35m -> \x1b[37mTarget is ${target.tag}`);
      	// add user to cooldown
      	avtCooldown.add(interaction.user.id);
        	setTimeout(() => {
          	// rm cooldown after it has passed
          	avtCooldown.delete(interaction.user.id);
        	}, avtCooldownTime);
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