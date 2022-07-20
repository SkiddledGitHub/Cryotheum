// discord.js modules
const { SlashCommandBuilder } = require('discord.js');

// custom modules
const { log } = require ('../lib/logging.js');
const { embedConstructor } = require('../lib/embeds.js');

// data
const { debug } = require('../config.json');

// set cooldown
const cooldown = new Set();
const cooldownTime = 4000;
const cooldownEmbed = embedConstructor("cooldown", { cooldown: '4 seconds' });

module.exports = {
  data: new SlashCommandBuilder()
  	.setName('avatar')
  	.setDescription('Get avatar from a Discord user.')	
		.addUserOption((option) => option.setName('target').setDescription('The target user to get the avatar from')),
	async execute(interaction) {
    	// cooldown management
      if (cooldown.has(interaction.user.id)) {
      await interaction.reply({ embeds: [cooldownEmbed] });
    	} else {

        // set executor
        const executor = { obj: interaction.member, tag: interaction.member.user.tag }

        // variables
        let target = {}

        if (debug) log('genLog', { event: 'Commands > Avatar', content: `Initialize`, extra: [`${executor.tag}`] })

      // set target
      // no target provided
      if (!interaction.options.getUser('target') && !interaction.options.getMember('target')) {

        // set executor as target
        target.obj = executor.obj
        target.tag = target.obj.user.tag
	      if (target.obj.avatar) {
		      target.avatarHash = target.obj.avatar
	      } else {
		      target.avatarHash = target.obj.user.avatar
	      };

      // if target is in server
      } else if (interaction.options.getUser('target') && interaction.options.getMember('target')) {

        // set target
        target.obj = interaction.options.getMember('target')
        target.tag = target.obj.user.tag
	      if (target.obj.avatar) {
		      target.avatarHash = target.obj.avatar
	      } else {
		      target.avatarHash = target.obj.user.avatar
	      };
    
      // if target is outside server
      } else if (interaction.options.getUser('target') && !interaction.options.getMember('target')) {

        // set target
        target.obj = interaction.options.getUser('target')
        target.tag = target.obj.tag
        target.avatarHash = target.obj.avatar

      };

      if (debug) log('genLog', { event: 'Commands > Avatar', content: `Target found`, extra: [`${target.tag}`] })

      // create embed object
      let embed

      if (target.avatarHash.slice(0,2) == 'a_') {
        embed = embedConstructor("avatar", { who: `${target.tag}`, image: `${target.obj.displayAvatarURL({ format: 'gif', dynamic: true, size: 1024 })}` })
      } else {
        embed = embedConstructor("avatar", { who: `${target.tag}`, image: `${target.obj.displayAvatarURL({ dynamic: true, size: 1024 })}` })
      }
    		
      // reply
      await interaction.reply({ embeds: [embed] })
      if (debug) log('genLog', { event: 'Commands > Avatar', content: `Done.`, extra: [`Executor: ${executor.tag}`, `Target: ${target.tag}`] })

    // cooldown management
    cooldown.add(interaction.user.id)
    setTimeout(() => { cooldown.delete(interaction.user.id); }, cooldownTime)
      	
    }
  },
  documentation: {
    name: 'avatar',
    category: 'Information',
    description: 'Get avatar from a Discord user.',
    syntax: '/avatar target:[UserOptional]',
    cooldown: `${Math.round(cooldownTime / 1000)} seconds`,
    arguments: [
      { name: 'target', targetValue: 'User [Optional]', description: 'The target user to get the avatar from.' }
    ]
  }
}
