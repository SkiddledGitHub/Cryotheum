const { SlashCommandBuilder } = require('@discordjs/builders');
const { embedCreator } = require('../tools/embeds.js');

const cooldown = new Set();
const cooldownTime = 3000;

const cooldownEmbed = embedCreator("ctd", { color: '#F04A47', title: 'You are under cooldown!', description: 'Default cooldown time for this command is 3 seconds.' });

module.exports = {
  data: new SlashCommandBuilder()
  	.setName('avatar')
  	.setDescription('Get avatar from a Discord user.')	
		.addUserOption((option) => option.setName('target').setDescription('The target user to get the avatar from').setRequired(true)),
	async execute(interaction) {
		const executor = interaction.member.user.tag;
    	const target = interaction.options.getUser('target');
    	const avatarEmbed = embedCreator("avatar", { title: `${target.tag}\'s avatar`, image: `${target.displayAvatarURL({ dynamic: true, size: 1024 })}` })
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