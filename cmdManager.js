const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const readline = require('readline');
const { stdin: input, stdout: output } = require('process');
const process = require('process');
const fs = require('fs');
const rl = readline.createInterface({ input, output });
const clientID = "413250765629423636";
const { botAuth } = require('./auth.json');

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(botAuth);

console.clear();

function cmdMan() {
  rl.question('\x1b[1;33m[Bot Commands Manager]:\n\x1b[0m\x1b[32m => \x1b[37mWhat would you like to do?\n\x1b[0m\x1b[32m => \x1b[37mEnter an option:\n\x1b[0m\x1b[32m => \x1b[37m(Destroy, Refresh, Exit)\n\x1b[0m\x1b[35m  ->\x1b[1;37m ', (option) => {

  option = option.toLowerCase();

  if ( option == "refresh" ) {
  (async () => {
    try {
      console.clear();
      console.log(' \x1b[1;32m=> \x1b[1;37mRefreshing (/) commands');

      await rest.put(
        Routes.applicationCommands(clientID),
        { body: commands },
      );

      console.log(' \x1b[1;32m=> SUCCESS: \x1b[1;37mSuccessfully refreshed (/) commands.\n');
      cmdMan();
    } catch (error) {
      console.error(` \x1b[1;31m=> ERROR: \x1b[1;37m${error}`);
    }
  })();
  } else if ( option == "destroy" ) {
    (async () => {
    try {
      console.clear();
      console.log(' \x1b[1;32m=> \x1b[1;37mDestroying (/) commands');

      await rest.put(
        Routes.applicationCommands(clientID),
        { body: [] },
      );

      console.log(' \x1b[1;32m=> SUCCESS: \x1b[1;37mSuccessfully destroyed (/) commands.\n');
      cmdMan();    
    } catch (error) {
      console.error(` \x1b[1;31m=> ERROR: \x1b[1;37m${error}`);
    }
  })();
  } else if ( option == "exit" ) {
    console.clear();
    console.log(' \x1b[1;32m=> \x1b[1;37mExiting!');
    process.exit();
  } else {
    console.log(' \x1b[1;31m=> ERROR: \x1b[1;37mInvalid option!\n');
    cmdMan();
  }
  })
}
cmdMan();