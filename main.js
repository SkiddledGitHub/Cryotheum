const { Client, Intents } = require('discord.js');
const fs = require('fs');
const process = require('process');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const { botAuth } = require('./auth.json');

// cooldown
const cooldown = new Set();
const cooldownTime = 8000;

// clear console
console.clear();

// notify ready
client.on('ready', () => {
  let serverCount = await client.guilds.cache.reduce((a, b) => a + b.memberCount, 0);
  console.log(`\x1b[1;32m==> SUCCESS: \x1b[1;37mLogged in (${client.user.tag})`);
  client.user.setActivity(`stdout | In ${serverCount} server(s)`, { type: 'WATCHING' });
  console.log(`\x1b[1;32m==> SUCCESS: \x1b[1;37mSet custom status for bot successfully.`);
});

// slash command handling
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'experiment') {
    if (cooldown.has(interaction.user.id)) {
      await interaction.reply({ 
          content: `You are under cooldown! (Default cooldown is 8s)`, 
          ephemeral: true 
        });
    } else {
      await interaction.reply({ 
        content: `There is no experiments being conducted right now.`, 
        ephemeral: true 
      });
      // add user to cooldown
      cooldown.add(interaction.user.id);
        setTimeout(() => {
          // rm cooldown after it has passed
          cooldown.delete(interaction.user.id);
        }, cooldownTime);
      }
  };

  // stdout command
  if (interaction.commandName === 'stdout') {
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
    }
});
client.login(botAuth);