const { SlashCommandBuilder } = require('discord.js');
const { embedConstructor } = require('../lib/embeds.js');
const { log }= require('../lib/logging.js');
const { debug } = require('../config.json');

const cooldown = new Set();
const cooldownTime = 1000;
const cooldownEmbed = embedConstructor("cooldown", { cooldown: '1 seconds' });

module.exports = {
  data: new SlashCommandBuilder()
  .setName('template')
  .setDescription('cmd template'),
  async execute(interaction) {
    if (cooldown.has(interaction.user.id)) {
    await interaction.reply({ embeds: [cooldownEmbed] });
      } else {

        console.log('test');
        interaction.reply('test');

        log('genLog', { event: 'test', content: 'test' });
      	
      	cooldown.add(interaction.user.id);
        setTimeout(() => { cooldown.delete(interaction.user.id); }, cooldownTime);

      }
  },
// NOTE: This is the custom documentation format
//       for the "help" command.
//       You can omit them if you want.
  documentation: {
    name: 'template',
    category: 'Testing',
    description: 'template command, replies with \"test\" and outputs \"test\" in the console',
    syntax: '/template',
    cooldown: `${Math.round(cooldownTime / 1000)} seconds`,
    arguments: []
  }
}
