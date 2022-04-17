const { SlashCommandBuilder } = require('@discordjs/builders');
const { embedCreator } = require('../tools/embeds.js');
const { debug } = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('experiment')
  .setDescription('latest and greatest'),
  async execute(interaction) {
      try {
      	// insert commands
        const embed = embedCreator('experiment', { desc: 'There is no experiments being conducted as of now.' });
        await interaction.reply({
            embeds: [embed],
            ephemeral: true
         })
      } catch (error) {
        if (debug) { errorEmbed = embedCreator("error", { error: `${error}` }) } else { errorEmbed = embedCreator("errorNoDebug", {}) };
      	await interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
      	})
      	console.error(` \x1b[1;31m=> ERROR: \x1b[1;37m${error}`);
    	}
  	},
}
