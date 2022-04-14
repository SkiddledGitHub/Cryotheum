const { SlashCommandBuilder } = require('@discordjs/builders');
const { embedCreator } = require('../tools/embeds.js');

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
        var errorEmbed = embedCreator("error", { error: `${error}` });
      	await interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
      	})
      	console.error(` \x1b[1;31m=> ERROR: \x1b[1;37m${error}`);
    	}
  	},
}
