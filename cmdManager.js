const process = require('process');
const { stdin: input, stdout: output } = require('process');
const fs = require('fs');
const readline = require('readline');
const rl = readline.createInterface({ input, output });

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const { botAuth, botID } = require('./config.json');

const rest = new REST({ version: '10' }).setToken(botAuth);

const { createLogString, log } = require('./lib/logging.js');
const { gitRevision, commandsManagement } = require('./lib/miscellaneous.js');

// TODO: As said in main.js, this approach to loading
//       command data is **slow**.
//       Will replace in the future.
const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

console.clear();

// NOTE: Should have implemented the config file check
//       here. It will definitely crash on launch if
//       config file is invalid.
function main() {
  rl.question(`${createLogString('genLog', { event: 'Commands', content: `Cryotheum Command Manager, revision \x1b[1;37m${gitRevision(true)}\x1b[0;37m\nChoose an option below:`, extra: ['\x1b[1;37m1\x1b[0;37m. Refresh commands', '\x1b[1;37m2\x1b[0;37m. Destroy commands', '\x1b[1;37m3\x1b[0;37m. Quit'] })}\n${createLogString('extra', { event: 'Selection', content: '\x1b[0;90m(1, 2 or 3) \x1b[0;37m' })}`,
    async (option) => {

    if (option === '1') {
      try { await commandsManagement({ rest: rest, botID: botID, commands: commands, method: 'refresh' }); } catch (e) { log('runtimeErr', { errName: e.name, event: 'Commands', content: `${e.message} ${e.reason}` }); }
    } else if (option === '2') {
      try { await commandsManagement({ rest: rest, botID: botID, method: 'destroy' }); } catch (e) { log('runtimeErr', { errName: e.name, event: 'Commands', content: `${e.message} ${e.reason}` }); }
    } else if (option === '3') {
      log('genLog', { event: 'Commands', content: 'Exiting!' });
      return rl.close();
    } else {
      log('error', { errName: 'Commands', content: 'Invalid option!' });
    }

    main();
  })
}

main();

