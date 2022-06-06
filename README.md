# Cryotheum
A private [Discord](https://discord.com) bot created out of boredom

## Setup
First, execute these commands listed in order:
```bash
git clone https://github.com/SkiddledGitHub/Cryotheum
cd Cryotheum
npm install
```
Then create a new text file in the **Cryotheum** folder which is called `config.json` and add these lines:
```json
{
	"botAuth": "insert bot token",
	"botOwner": "insert bot owner's Discord id",
	"loggingMessages": false,
	"debug": false,
	"specialBadges": {

	}
}
```
then save the file.
Return to terminal and execute:
```bash
node cmdHandler.js
```
and select the option to refresh slash commands. Exit out then execute:
```bash
node main.js
```
The bot should now start.

## Miscelaneous
#### The `loggingMessages` flag in `config.json`
The bot will start logging all messages and send them to Terminal from all servers that it has access to. [^1]
#### The `debug` flag in `config.json`
The bot will start logging **some** actions and send them to Terminal for debugging purposes. This does not log messages [^2]
This option will also add fail reasons to error embeds.
#### The `specialBadges` array in `config.json`
Adds "badges" (emojis) under the Special Badges field in the userinfo command.
Format is [^3]:
```json
"specialBadges": {
	"user id": "emoji"
}
``` 

[^1]: This will be removed from the public release soonTM

[^2]: Actions that will be logged once the debug flag is enabled: avatar, ban, eval, play, unban, userinfo success and failures and generic NodeJS errors

[^3]: Example: ```"285329659023851520": "<:botDev:965220811436855326>```