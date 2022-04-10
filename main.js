const { botAuth } = require('./auth.json');
const { Client, Intents } = require('discord.js');
const { MessageAttachment, MessageEmbed } = require('discord.js');
const fs = require('fs');
const process = require('process');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// cooldown
const cooldown = new Set();
const cooldownTime = 8000;

// clear console
console.clear();

// notify ready
client.on('ready', () => {
  console.log(`\x1b[1;32m==> SUCCESS: \x1b[1;37mLogged in (${client.user.tag})`);
  client.user.setActivity(`stdout | In ${client.guilds.cache.size} server(s)`, { type: 'WATCHING' });
  console.log(`\x1b[1;32m==> SUCCESS: \x1b[1;37mSet custom status for bot successfully.`);
});

// slash command handling
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'experiment') {
    const avatarEmbed = {
      color: '#42B983',
      title: `${interaction.options.getUser('target').tag}\'s avatar`,
      image: {
        url: `${interaction.options.getUser('target').displayAvatarURL({ dynamic: true, size: 1024 })}`,
      },
  };
    try {
    if (cooldown.has(interaction.user.id)) {
      await interaction.reply({ 
          content: `You are under cooldown! (Default cooldown is 8s)`, 
          ephemeral: true 
        });
    } else {
      await interaction.reply({ 
        embeds: [avatarEmbed],
        ephemeral: true 
      });
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
  };

  // stdout command
  if (interaction.commandName === 'stdout') {
    try {
    if (cooldown.has(interaction.user.id)) {
      await interaction.reply({ 
          content: `You are under cooldown! (Default cooldown is 8s)`, 
          ephemeral: true 
        });
    } else {
      const member = interaction.member.user.tag;
      const message = interaction.options.getString('message');
      var nonAscii = /^[\u0000-\u007f]*$/.test(message);
      var messageLength = message.length;
        if ( nonAscii == false ) {
          await interaction.reply({ 
          content: `Message must not contain non ASCII characters.`, 
          ephemeral: true 
        });
        console.log(`\x1b[1;33m==> WARNING: \x1b[1;33m${member} tried to send a message to stout but message was blocked.\n\x1b[0m\x1b[35m -> \x1b[37mMessage contained non ASCII characters.`);
      } else if ( nonAscii == true ) {
        if ( messageLength > 1970 ) {
          await interaction.reply({ 
          content: `Message must not be longer than 1970 characters.`,
          ephemeral: true 
        });
        console.log(`\x1b[1;33m==> WARNING: \x1b[1;37m${member} tried to send a message to stdout but message was blocked.\n\x1b[0m\x1b[35m -> \x1b[37mMessage was more than 1970 characters in length.`);
        } else if ( messageLength <= 1970 ) {
        await interaction.reply({ 
          content: `Sent "${message}" to stdout`, 
          ephemeral: true 
        });
          console.log(`\x1b[1;32m==> \x1b[1;37m${member} called experiment: ${message}`);
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
  }
});
client.login(botAuth);
