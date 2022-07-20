// modules
const { SlashCommandBuilder } = require('discord.js');
const { embedConstructor } = require('../lib/embeds.js');
const { log }= require('../lib/logging.js');
const { debug } = require('../config.json');

// cooldown
const cooldown = new Set();
const cooldownTime = 1000;
const cooldownEmbed = embedConstructor("cooldown", { cooldown: '1 seconds' });

module.exports = {
  data: new SlashCommandBuilder()
  .setName('template')
  .setDescription('cmd template'),
  async execute(interaction) {
    // cooldown management
    if (cooldown.has(interaction.user.id)) {
    await interaction.reply({ embeds: [cooldownEmbed] });
      } else {

      	// insert commands
        console.log('test');
        interaction.reply('test');

        // custom logging
        log('genLog', { event: 'test', content: 'test' });
      	
        // cooldown management
      	cooldown.add(interaction.user.id);
        setTimeout(() => { cooldown.delete(interaction.user.id); }, cooldownTime);

      }
  },
  documentation: {
    name: 'template',
    category: 'Testing',
    description: 'template command, replies with \"test\" and outputs \"test\" in the console',
    syntax: '/template',
    cooldown: `${Math.round(cooldownTime / 1000)} seconds`,
    arguments: []
  }
}
