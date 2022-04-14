const { SlashCommandBuilder } = require('@discordjs/builders');
const { embedCreator } = require('../tools/embeds.js');

const cooldownEmbed = embedCreator("ctd", { color: '#F04A47', title: 'You are under cooldown!', description: 'Default cooldown time for this command is 6 seconds.' });

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
          embeds: [cooldownEmbed], 
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
        var errorEmbed = embedCreator("error", { error: `${error}` });
      	await interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
      	})
      	console.error(` \x1b[1;31m=> ERROR: \x1b[1;37m${error}`);
    	}
  	},
}
