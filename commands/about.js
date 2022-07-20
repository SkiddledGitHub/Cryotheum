// discord.js modules
const { SlashCommandBuilder } = require('discord.js');

// custom modules
const { log } = require('../lib/logging.js');
const { embedConstructor } = require('../lib/embeds.js');

// data
const { debug, botOwner } = require('../config.json');

// set cooldown
const cooldown = new Set();
const cooldownTime = 1000;

module.exports = {
  data: new SlashCommandBuilder()
  .setName('about')
  .setDescription('Display information about the bot'),
  async execute(interaction) {
      // cooldown management
      if (cooldown.has(interaction.user.id)) {
      await interaction.reply({ embeds: [cooldownEmbed] });
      } else {
        
        // constants
        const executor = { obj: interaction.member, tag: interaction.member.user.tag }

        if (debug) log('genLog', { event: 'Commands > About', content: `Initialize`, extra: [`${executor.tag}`] })

        let embed = embedConstructor('about', { uptime: Math.floor(interaction.client.readyTimestamp / 1000), botOwnerID: botOwner, debugStatus: `${debug}` })
        interaction.reply({ embeds: [embed] })
        if (debug) log('genLog', { event: 'Commands > About', content: `Done.` })
        
        // cooldown management
        cooldown.add(interaction.user.id)
        setTimeout(() => { cooldown.delete(interaction.user.id); }, cooldownTime)
        
        }
    },
  documentation: {
    name: 'about',
    category: 'Information',
    description: 'Display information about the bot.',
    syntax: '/about',
    cooldown: `${Math.round(cooldownTime / 1000)} seconds`,
    arguments: []
  }
}