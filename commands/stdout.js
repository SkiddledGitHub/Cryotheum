const { SlashCommandBuilder } = require('@discordjs/builders');

const cooldown = new Set();
const cooldownTime = 8000;

module.exports = {
  data: new SlashCommandBuilder()
  .setName('stdout')
  .setDescription('Send a message to the hoster\'s Terminal stdout!')
  .addStringOption((option) => option.setName('message').setDescription('The message to send to Terminal').setRequired(true)),
  async execute(interaction) {
      try {
      if (cooldown.has(interaction.user.id)) {
      await interaction.reply({ 
          content: `You are under cooldown! (Default cooldown is 8s)`, 
          ephemeral: true 
        });
      } else {
        const executor = interaction.member.user.tag;
        const message = interaction.options.getString('message');
        var nonAscii = /^[\u0000-\u007f]*$/.test(message);
        var messageLength = message.length;
        if ( nonAscii == false ) {
            await interaction.reply({ 
            content: `Message must not contain non ASCII characters.`, 
            ephemeral: true 
          });
        console.log(`\x1b[1;33m==> WARNING: \x1b[1;37m${executor} tried to send a message to stout but message was blocked.\n\x1b[0m\x1b[35m -> \x1b[37mMessage contained non ASCII characters.`);
      } else if ( nonAscii == true ) {
          if ( messageLength > 1970 ) {
          await interaction.reply({ 
          content: `Message must not be longer than 1970 characters.`,
          ephemeral: true 
        });
        console.log(`\x1b[1;33m==> WARNING: \x1b[1;37m${executor} tried to send a message to stdout but message was blocked.\n\x1b[0m\x1b[35m -> \x1b[37mMessage was more than 1970 characters in length.`);
      } else if ( messageLength <= 1970 ) {
        await interaction.reply({ 
          content: `Sent "${message}" to stdout`, 
          ephemeral: true 
        });
          console.log(`\x1b[1;32m==> \x1b[1;37m${executor} sent a message to stdout: \n\x1b[0m\x1b[35m -> \x1b[37m${message}`);
          }
        };
      // add user to cooldown
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