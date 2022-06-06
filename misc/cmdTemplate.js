// modules
const { SlashCommandBuilder } = require('@discordjs/builders');

// set cooldown
const cooldown = new Set();
const cooldownTime = 1000;

module.exports = {
  data: new SlashCommandBuilder()
  .setName('template')
  .setDescription('cmd template'),
  async execute(interaction) {
      if (cooldown.has(interaction.user.id)) {
      await interaction.reply('cooldown');
      } else {
      	// insert commands
        console.log('test');
        interaction.reply('test');
      	
      	cooldown.add(interaction.user.id);
        	setTimeout(() => {
          	// rm cooldown after it has passed
          	cooldown.delete(interaction.user.id);
        	}, cooldownTime);
      	}
  }
}
