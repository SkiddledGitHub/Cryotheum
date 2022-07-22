const process = require('process');
const fs = require('node:fs');

const { log } = require('./lib/logging.js');
const { embedConstructor } = require('./lib/embeds.js');
const { gitRevision } = require('./lib/miscellaneous.js');
const configUtils = require('./lib/config.js');

console.clear();

log('genLog', { event: 'Init', content: `Running Cryotheum, revision \x1b[1;37m${gitRevision(true)}\x1b[0;37m` })


// TODO: Make the validate function more efficient?
//       Right now it sometimes slows down startup
//       by quite a bit of time.
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

const { Client, GatewayIntentBits, Collection } = require('discord.js');

const { botAuth, loggingMessages, debug } = require('./config.json');

// TODO: Maybe we don't need this much intents,
//       but oh well.
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

// TODO: Maybe optimize command loading?
//       It's quite slow as well.
client.commands = new Collection()
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
log('genLog', { event: 'Init > Loading', content: `Loading commands` })
for (const files of commandFiles) {
  const command = require(`./commands/${files}`)
  client.commands.set(command.data.name, command)
  if (debug) log('extra', { event: 'Loading', content: `Loaded \"${command.data.name}\"` })
}

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

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return

  const command = client.commands.get(interaction.commandName)

  if (!command) return

  try {
    await command.execute(interaction)
  } catch (e) {
    log('runtimeErr', { errName: e.name, event: command.data.name, content: e.message })
  }
})

try {
  client.login(botAuth)
} catch (e) {
  log('runtimeErr', { errName: e.name, event: 'Login', content: e.message })
}
