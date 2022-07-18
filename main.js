/**
 *
 * Copyright 2022 SkiddledGitHub
 *
 * This file is part of Cryotheum.
 * Cryotheum is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * Cryotheum is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; 
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with the Cryotheum source code. 
 * If not, see <https://www.gnu.org/licenses/>.
 *
 */

// node modules
const process = require('process');
const fs = require('node:fs');

// custom modules
const { log } = require('./lib/logging.js');
const { embedConstructor } = require('./lib/embeds.js');
const { gitRevision } = require('./lib/miscellaneous.js');
const configUtils = require('./lib/config.js');

// clear console
console.clear();

log('genLog', { event: 'Init', content: `Running Cryotheum, revision \x1b[1;37m${gitRevision(true)}\x1b[0;37m` })

try {
  configUtils.validate();
} catch (e) {
  if (e.status === 'ENOENT') {
    log('genWarn', { event: 'Init', content: 'No config file was found! Launching setup' })
  } else if (e.status === 'MALFORMED') {
    log('genWarn', { event: 'Init', content: 'A malformed config file was found! Launching setup' })
  } else if (e.status === 'MISSING') {
    log('genWarn', { event: 'Init', content: 'A malformed config file was found with missing parameters! Launching setup' })
  }
  const { mainSetupFunction } = require('./setup.js');
  mainSetupFunction();
}

// discord.js modules
const { Client, GatewayIntentBits, Collection } = require('discord.js');

// data
const { botAuth, loggingMessages, debug } = require('./config.json');

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.MessageContent
  ],
  presence: { status: 'idle', activities: [{ name: `over you`, type: 'WATCHING' }] }
});

// commands import
client.commands = new Collection()
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
log('genLog', { event: 'Init > Loading', content: `Loading commands` })
for (const files of commandFiles) {
  const command = require(`./commands/${files}`)
  client.commands.set(command.data.name, command)
  if (debug) log('extra', { event: 'Loading', content: `Loaded \"${command.data.name}\"` })
}

// notify ready
client.on('ready', () => {
  log('genLog', { event: 'Init > Ready', content: `Logged in as \x1b[1;37m${client.user.tag}\x1b[0;37m` })

  if (loggingMessages) { 
    log('genLog', { event: 'Init > Logging', content: 'Bot is now logging messages', cause: '\"loggingMessages\" = \x1b[31mtrue\x1b[37m in config.json' })
  } else { 
    log('genLog', { event: 'Init > Logging', content: 'Bot is not logging messages.', cause: '\"loggingMessages\" = \x1b[31mfalse\x1b[37m in config.json' })
  }

  if (debug) { 
    log('genLog', { event: 'Init > Logging', content: 'Bot is now in Debug mode. Almost all events will be logged.', cause: '\"debug\" = \x1b[31mtrue\x1b[37m in config.json'})
  } else { 
    log('genLog', { event: 'Init > Logging', content: `Bot is in Production mode. Only errors will be logged.`, cause: '\"debug\" = \x1b[31mfalse\x1b[37m in config.json' })
  }

})

// slash command handling
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return

  const command = client.commands.get(interaction.commandName)

  if (!command) return

  try {
    await command.execute(interaction)
  } catch (error) {
    let embed
    if (debug) { embed = embedConstructor("error", { error: `${error}` }) } else { embed = embedConstructor("errorNoDebug", {}) }
    log('runtimeErr', { errName: error.name, event: command.data.name, content: error.message })
  console.log(error)
    if (interaction.isRepliable()) {
      interaction.reply({ embeds: [embed], ephemeral: true })
    } else {
      try {
        interaction.followUp({ embeds: [embed] })
      } catch (e) {
        interaction.channel.send({ embeds: [embed] })
      }
    }
  }
})

// login
try {
  client.login(botAuth)
} catch (e) {
  log('runtimeErr', { errName: e.name, event: 'Login', content: e.message })
}
