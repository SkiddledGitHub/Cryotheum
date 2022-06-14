/**
 *
 * Copyright 2022 SkiddledGitHub (Discord: Skiddled#0802)
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


// warning
// this file contains bad code that has not been rewritten since ages
// please dont bully me


const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const readline = require('readline');
const { stdin: input, stdout: output } = require('process');
const process = require('process');
const fs = require('fs');
const rl = readline.createInterface({ input, output });
const { botAuth, botID } = require('./config.json');

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(botAuth);

console.clear();

rl.question('\x1b[1;33m[Guild Based Bot Commands Manager]:\n\x1b[0m\x1b[32m => \x1b[37mEnter a Guild ID:\n\x1b[0m\x1b[35m  ->\x1b[1;37m ', (guildID) => {
  console.clear();

function cmdMan() {
  rl.question('\x1b[1;33m[Guild Based Bot Commands Manager]:\n\x1b[0m\x1b[32m => \x1b[37mWhat would you like to do?\n\x1b[0m\x1b[32m => \x1b[37mEnter an option:\n\x1b[0m\x1b[32m => \x1b[37m(Destroy, Refresh, Exit)\n\x1b[0m\x1b[35m  ->\x1b[1;37m ', (option) => {

  option = option.toLowerCase();

  if ( option == "refresh" ) {
  (async () => {
    try {
      console.clear();
      console.log(' \x1b[1;32m=> \x1b[1;37mRefreshing (/) commands');

      await rest.put(
        Routes.applicationGuildCommands(botID, guildID),
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
        Routes.applicationGuildCommands(botID, guildID),
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
});
