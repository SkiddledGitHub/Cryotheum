const { SlashCommandBuilder } = require('@discordjs/builders');
const { ShardClientUtil } = require('discord.js');

// set owner, replace with your id
var botOwner = "285329659023851520";

module.exports = {
  data: new SlashCommandBuilder()
  	.setName('eval')
  	.setDescription('Evaluate JS code. Restricted to bot owner (for obvious reasons)')
  	.addStringOption((option) => option.setName('code').setDescription('Code to evaluate').setRequired(true)),
  async execute(interaction) {
      const executor = interaction.member;
      const code = interaction.options.getString('code');
      try {

      	if (executor.user.id != botOwner) {
          await interaction.reply({
            content: 'You cannot do this as you do not own the bot!'
          });
          console.log(`\x1b[1;32m==>\x1b[1;37m ${executor.user.tag} tried to execute eval but failed: \n\x1b[0m\x1b[35m -> \x1b[37mUser is not bot owner.`);
          return;
        }

          var result = code;
          try { let evaled = eval(result); } catch (error) { await interaction.reply({ content: `An error occurred: ${error}`, ephemeral: true });
          console.error(`\x1b[1;31m==> ERROR: \x1b[1;37m${error}`);
        }
          console.log(`\x1b[1;32m==>\x1b[1;37m Evaluated code. \n\x1b[0m\x1b[35m -> \x1b[37m${result}`);

      } catch (error) {
      	await interaction.reply({
        	content: `An error occurred: ${error}`,
        	ephemeral: true
      	})
      	console.error(`\x1b[1;31m==> ERROR: \x1b[1;37m${error}`);
    	}
  	},
}
