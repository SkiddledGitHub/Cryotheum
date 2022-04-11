const { SlashCommandBuilder } = require('@discordjs/builders');

const cooldown = new Set();
const cooldownTime = 6000;

module.exports = {
  data: new SlashCommandBuilder()
  .setName('template')
  .setDescription('cmd template')
  async execute(interaction) {
      try {
      if (cooldown.has(interaction.user.id)) {
      await interaction.reply({ 
          content: `You are under cooldown! (Default cooldown is 6s)`, 
          ephemeral: true 
        });
      } else {
      	// insert commands
      	
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
