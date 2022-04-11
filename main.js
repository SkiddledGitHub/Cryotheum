const { botAuth } = require('./auth.json');
const { Client, Intents, Collection } = require('discord.js');
const { MessageAttachment, MessageEmbed } = require('discord.js');
const { MessageActionRow, MessageButton, ButtonInteraction } = require('discord.js');
const fs = require('node:fs');
const process = require('process');
const client = new Client({ intents: [ Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, ] });

// cooldown

// commands import
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const files of commandFiles) {
const command = require(`./commands/${files}`);
client.commands.set(command.data.name, command);
}

// clear console
console.clear();

// notify ready
client.on('ready', () => {
  console.log('\x1b[1;33m-------------------------------[ Bot Initiation ]-------------------------------');
  console.log(`\x1b[1;32m==> \x1b[1;37mLogged in (${client.user.tag})`);
  client.user.setActivity(`stdout | In ${client.guilds.cache.size} server(s)`, { type: 'WATCHING' });
  console.log(`\x1b[1;32m==> \x1b[1;37mSet custom status for bot successfully.`);
  console.log('\x1b[1;33m-------------------------------------------------------------------------------');
  console.log('\n\x1b[1;33m------------------------------------[ Log ]------------------------------------');
});

// slash command handling
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: `An error has occurred: ${error}`, ephemeral: true });
  }

});

// login
client.login(botAuth);
