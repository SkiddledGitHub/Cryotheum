const { SlashCommandBuilder } = require('@discordjs/builders');

const cooldown = new Set();
const cooldownTime = 6000;

module.exports = {
  data: new SlashCommandBuilder()
  .setName('experiment')
  .setDescription('latest and greatest'),
  async execute(interaction) {
      try {
      	// insert commands
        await interaction.reply({
            content: `There is no experiments being conducted as of now.`,
            ephemeral: true
         })
      } catch (error) {
      	await interaction.reply({
        	content: `An error occurred: ${error}`,
        	ephemeral: true
      	})
      	console.error(`\x1b[1;31m==> ERROR: \x1b[1;37m${error}`);
    	}
  	},
}
