// modules
const { botAuth, loggingMessages } = require('./config.json');
const { joinVoiceChannel, getVoiceConnection, VoiceConnectionStatus } = require('@discordjs/voice');
const { Client, Intents, Collection, MessageAttachment, MessageEmbed } = require('discord.js');
const fs = require('node:fs');
const process = require('process');
const ytdl = require('ytdl-core');
const { embedCreator } = require('./tools/embeds.js');
const client = new Client({ intents: [ Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_VOICE_STATES ] });

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
  console.log(`\x1b[1;33m[Bot Initiation]:`);
  console.log(` \x1b[1;32m=> \x1b[1;37mLogged in (${client.user.tag})`);
  client.user.setActivity(`stdout | In ${client.guilds.cache.size} server(s)`, { type: 'WATCHING' });
  console.log(` \x1b[1;32m=> \x1b[1;37mSet custom status for bot successfully.`);
  if (loggingMessages == true) { console.log(` \x1b[1;32m=> \x1b[1;37mBot is now logging messages. \n\x1b[0m\x1b[35m  -> Cause:\x1b[0;37m loggingMessages is set to \"true\"`); } else { console.log(` \x1b[1;32m=> \x1b[1;37mBot is not logging messages. \n\x1b[0m\x1b[35m  -> Cause:\x1b[0;37m loggingMessages is set to \"false\"`); }
  console.log(`\n\x1b[1;33m[Logging]:`);
});

// slash command handling
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    var errorEmbed = embedCreator("error", { error: `${error}` });
    console.error(error);
    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
  }

});

if (loggingMessages == true) {
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
