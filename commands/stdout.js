// modules
const { SlashCommandBuilder } = require('@discordjs/builders');
const { embedCreator } = require('../tools/embeds.js');
const { debug } = require('../config.json');

// set cooldown
const cooldown = new Set();
const cooldownTime = 5000;
const cooldownEmbed = embedCreator("cooldown", { cooldown: '5 seconds' });

module.exports = {
  data: new SlashCommandBuilder()
  .setName('stdout')
  .setDescription('Send a message to the hoster\'s Terminal stdout!')
  .addStringOption((option) => option.setName('message').setDescription('The message to send to Terminal').setRequired(true)),
  async execute(interaction) {
      try {
      if (cooldown.has(interaction.user.id)) {
      await interaction.reply({ 
          embeds: [cooldownEmbed]
        });
      } else {
        
        // constants
        const executor = interaction.member.user.tag;
        const message = interaction.options.getString('message');

        // variables
        var nonAscii = /^[\u0000-\u007f]*$/.test(message);
        var messageLength = message.length;

        // if message contains non ASCII characters
        if ( nonAscii == false ) {

            // set embed
          const embed = embedCreator('stdoutFailed', { message: '[ BLOCKED ]', reason: 'Message contained non ASCII characters.' });
            
            // reply & log fail & return
          await interaction.reply({ 
            embeds: [embed],
            ephemeral: true 
          });
          if (debug) {
          console.log(` \x1b[1;33m=> WARNING: \x1b[1;37m${executor} tried to send a message to stout but message was blocked.\n\x1b[0m\x1b[35m  -> \x1b[37mMessage contained non ASCII characters.`);
          };
          return;

      // if message only contains ASCII characters
      } else if ( nonAscii == true ) {
          
          // if message length is longer than 1970 characters, pull fail
          if ( messageLength > 1970 ) {

          // set embed
          const embed = embedCreator('stdoutFailed', { message: '[ BLOCKED ]', reason: 'Message contained more than 1970 characters.' });

          // reply & log fail & return
          await interaction.reply({ 
          embeds: [embed],
          ephemeral: true 
        });
        if (debug) {
        console.log(` \x1b[1;33m=> WARNING: \x1b[1;37m${executor} tried to send a message to stdout but message was blocked.\n\x1b[0m\x1b[35m  -> \x1b[37mMessage was more than 1970 characters in length.`);
        };
        return;

      // if message length is lower than 1970 characters
      } else if ( messageLength <= 1970 ) {

        // set embed
        const embed = embedCreator('stdoutSuccess', { message: `${message}` });

        // reply & log fail & return
        await interaction.reply({ 
          embeds: [embed],
          ephemeral: true 
        });
        if (debug) {
        console.log(` \x1b[1;32m=> \x1b[1;37m${executor} sent a message to stdout: \n\x1b[0m\x1b[35m  -> \x1b[37m${message}`);
        };
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
      if (debug) { errorEmbed = embedCreator("error", { error: `${error}` }) } else { errorEmbed = embedCreator("errorNoDebug", {}) };
      await interaction.reply({
          embeds: [errorEmbed],
          ephemeral: true
      })
      console.error(` \x1b[1;31m=> ERROR: \x1b[1;37m${error}`);
    }
  },
}