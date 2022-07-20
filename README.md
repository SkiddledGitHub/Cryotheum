# Cryotheum
[![GitHub Issues Tracker](https://img.shields.io/github/issues/SkiddledGitHub/Cryotheum?logo=github&style=flat)](https://github.com/SkiddledGitHub/Cryotheum/issues)
[![GitHub Project Page](https://img.shields.io/badge/Project%20Page-Cryotheum-blue?logo=github&style=flat)](https://github.com/users/SkiddledGitHub/projects/1)
[![License](https://img.shields.io/github/license/SkiddledGitHub/Cryotheum&logoColor=ffffff&style=flat)](http://www.wtfpl.net/txt/copying/)
[![Language](https://img.shields.io/badge/Language-NodeJS-%23339933?logo=node.js&logoColor=ffffff&style=flat)](https://nodejs.org)  
A portable, easy-to-modify [Discord](https://discord.com) bot  
<sub>it's honestly just inefficient code and spaghetti smashed together to create this mess that works somehow</sub>

## Setup
1. Create a bot user at the Discord Developer Portal  
Make sure to also enable these intents! They are necessary for the bot to function.  
![Intents](https://i.imgur.com/vm37TUA.png)
2. Then, execute these commands listed in order:
```bash
git clone https://github.com/SkiddledGitHub/Cryotheum
cd Cryotheum
npm install
node setup.js
```
3. Return to terminal and execute:
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
  
[^1]: This will be removed from the public release soonTM
  
[^2]: Actions that will be logged once the debug flag is enabled: Almost everything (command execution status, generic NodeJS errors... does not include messages)
  
[^3]: Example: ```"285329659023851520": "<:botDev:965220811436855326>"```
