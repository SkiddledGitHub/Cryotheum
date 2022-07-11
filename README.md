# Cryotheum
[![GitHub Issues Tracker](https://img.shields.io/github/issues/SkiddledGitHub/Cryotheum?logo=github&style=flat)](https://github.com/SkiddledGitHub/Cryotheum/issues)
[![GitHub Issues Tracker](https://img.shields.io/badge/Project%20Page-Cryotheum-blue?logo=github&style=flat)](https://github.com/users/SkiddledGitHub/projects/1)
[![License](https://img.shields.io/github/license/SkiddledGitHub/Cryotheum?logo=gnu&logoColor=ffffff&style=flat)](https://www.gnu.org/licenses/gpl-3.0-standalone.html)
[![Language](https://img.shields.io/badge/Language-NodeJS-%23339933?logo=node.js&logoColor=ffffff&style=flat)](https://nodejs.org)  
A portable, easy-to-modify [Discord](https://discord.com) bot  
<sub>it's honestly just inefficient code and spaghetti smashed together to create this mess that works somehow</sub>

## Setup
1. First, execute these commands listed in order:
```bash
git clone https://github.com/SkiddledGitHub/Cryotheum
cd Cryotheum
npm install
node setup.js
```
2. Return to terminal and execute:
```bash
node cmdManager.js
```
and select the option to refresh slash commands. Exit out then execute:
```bash
node main.js
```
The bot should now start.

## Miscelaneous
#### The `loggingMessages` flag in `config.json`
The bot will start logging all messages and send them to Terminal from all servers that it has access to [^1]  
#### The `debug` flag in `config.json`
The bot will start logging **some** actions and send them to Terminal for debugging purposes. This does not log message [^2]  
This option will also add fail reasons to error embeds.
#### The `specialBadges` array in `config.json`
Adds "badges" (emojis) under the Special Badges field in the userinfo command.  
Format is [^3]:
```json
"specialBadges": {
	"user id": "emoji"
}
```  
#### The `githubAuth` string in `config.json`  
This string allows you to provide the bot a GitHub Personal Access Token.  
The token allows the bot to have better access to the GitHub API (currently for accessing contribution data on repositories and is required for accessing commits data on users)  
However this is optional and can be left blank.  
If you want to provide an access token for the bot, please access https://github.com/settings/tokens/new and create a new token with the `public_repo` and `read:user` scopes (Preferably make the token not expire) then paste the token in the config file.  
Example:
```json
"githubAuth": "ghp_XXXXXXXXXXXXXXXXXXXXXX"
```
## License
Copyright 2022 SkiddledGitHub
  
This program is licensed under the terms of the **GNU General Public License**.
  
This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
  
This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
  
You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
  
[^1]: This will be removed from the public release soonTM
  
[^2]: Actions that will be logged once the debug flag is enabled: Almost everything (command execution status, generic NodeJS errors... does not include messages)
  
[^3]: Example: ```"285329659023851520": "<:botDev:965220811436855326>"```
