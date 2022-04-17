// modules
const { SlashCommandBuilder } = require('@discordjs/builders');
const { embedCreator } = require('../tools/embeds.js');
const { debug } = require('../config.json');

// set cooldown
const cooldown = new Set();
const cooldownTime = 6000;
const cooldownEmbed = embedCreator("cooldown", { cooldown: '6 seconds' });


module.exports = {
  data: new SlashCommandBuilder()
  .setName('template')
  .setDescription('cmd template'),
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
        var errorEmbed
        if (debug) { errorEmbed = embedCreator("error", { error: `${error}` }) } else { errorEmbed = embedCreator("errorNoDebug", {}) };
      	await interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
      	})
      	console.error(` \x1b[1;31m=> ERROR: \x1b[1;37m${error}`);
    	}
  	},
}
