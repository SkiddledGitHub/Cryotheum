/**
 * Copyright 2022 SkiddledGitHub (Discord: Skiddled#0802)
 * This program is distributed under the terms of the GNU General Public License.
 */

// modules
const { botAuth, loggingMessages, debug } = require('./config.json');
const { Client, Intents, Collection, MessageEmbed } = require('discord.js');
const fs = require('node:fs');
const process = require('process');
const { embedCreator } = require('./tools/embeds.js');
const client = new Client({ intents: [ Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_VOICE_STATES ], 
                            presence: { status: 'idle', activities: [{ name: `over you`, type: 'WATCHING' }] }
                          });

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
  console.log(`\x1b[1;33m[Bot Initiation]:\x1b[0m`);
  console.log(` \x1b[1;32m=> Logged in (${client.user.tag})\x1b[0m`);
  //client.user.setActivity(`stdout | In ${client.guilds.cache.size} server(s)`, { type: 'WATCHING' });
  if (loggingMessages) { console.log(` \x1b[1;32m=> Bot is now logging messages. \n\x1b[0m\x1b[35m  -> Cause:\x1b[0;37m loggingMessages is set to \"true\" in config.json`); } else { console.log(` \x1b[1;32m=> Bot is not logging messages. \n\x1b[0m\x1b[35m  -> Cause:\x1b[0;37m loggingMessages is set to \"false\" in config.json`); };
  if (debug) { console.log(` \x1b[1;32m=> Bot is now in Debug mode. Almost all events will be logged.\n\x1b[0m\x1b[35m  -> Cause:\x1b[0;37m debug is set to \"true\" in config.json`); } else { console.log(` \x1b[1;32m=> Bot is in Production mode. Only errors will be logged. \n\x1b[0m\x1b[35m  -> Cause:\x1b[0;37m debug is set to \"false\" in config.json`); };
  console.log(`\n\x1b[1;33m[Log]:\x1b[0m`);
});

// slash command handling
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    let embed
    if (debug) { embed = embedCreator("error", { error: `${error}` }) } else { embed = embedCreator("errorNoDebug", {}) };
    console.error(error);
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
});


if (loggingMessages) {
  client.on('messageCreate', async message => {
    try {
      console.log(` \x1b[0m\x1b[1;36m=> \x1b[1;37m${message.author.tag}\x1b[0m from \x1b[1;37m${message.guild.name} (${message.channel.name})\x1b[0m: ${message.content}`);
      if (message.attachments.size != 0) { var attachmentList = message.attachments.toJSON(); for (let i in attachmentList) { console.log(`    \x1b[1;37mAttachment\x1b[0m: ${attachmentList[i].attachment}`); }; };
    } catch(error) {
      console.error(` \x1b[1;31m=> ERROR: \x1b[1;37m${error}`);
    }
  });
};

// login
client.login(botAuth);