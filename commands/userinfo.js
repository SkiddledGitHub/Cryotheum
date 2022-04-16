// modules
const { SlashCommandBuilder, codeBlock, time } = require('@discordjs/builders');
const { embedCreator } = require('../tools/embeds.js');
const emojis = require('node-emoji');

// set cooldown
const cooldown = new Set();
const cooldownTime = 6000;
const cooldownEmbed = embedCreator("cooldown", { cooldown: '6 seconds' });

module.exports = {
  data: new SlashCommandBuilder()
  .setName('userinfo')
  .setDescription('Get user profile from a Discord user')
  .addUserOption((option) => option.setName('target').setDescription('User to get user information from')),
  async execute(interaction) {
      try {
      if (cooldown.has(interaction.user.id)) {
      await interaction.reply({ 
          embeds: [cooldownEmbed], 
          ephemeral: true 
        });
      } else {

      	// constants
      	const executor = interaction.member;

      	// variables

      	// define target variables
      	var target;
      	var targetTag;
      	var targetID;

      	// define date variables
      	var joinedAt;
      	var createdAt;

      	// define guild member data variables
      	var roles;

      	// define important variables
      	var embed;
      	var isGuildMember;

      	// if option is blank, get executor's data instead
      	if (interaction.options.getMember('target') == null && interaction.options.getUser('target') == null) {
      		
      		// assign target as executor
      		target = executor;
      		targetTag = target.user.tag;
          	targetID = codeBlock('yaml', `ID: ${target.id}`);
          	isGuildMember = true;

      		// get target's roles
      		roles = target.roles.cache.map(r => r).toString().replace(/,/g, ' ');

      		// get target's guild join and account creation date
          	joinedAt = { full: `${time(target.joinedAt, 'F')}`, mini: `${time(target.joinedAt, 'R')}` };
            createdAt = { full: `${time(target.user.createdAt, 'F')}`, mini: `${time(target.user.createdAt, 'R')}` };
      	
      	};

      	// if target is guild member
      	if (interaction.options.getMember('target') != null) {

      		// assigning target
      		target = interaction.options.getMember('target');
      		targetTag = target.user.tag;
      		targetID = codeBlock('yaml', `ID: ${target.id}`);
      		isGuildMember = true;

      		// get target's roles
      		roles = target.roles.cache.map(r => r).toString().replace(/,/g, ' ');

      		// get target's guild join and account creation date
          	joinedAt = { full: `${time(target.joinedAt, 'F')}`, mini: `${time(target.joinedAt, 'R')}` };
            createdAt = { full: `${time(target.user.createdAt, 'F')}`, mini: `${time(target.user.createdAt, 'R')}` };

      	};

      	// if member is not guild member
      	if (interaction.options.getMember('target') == null && interaction.options.getUser('target') != null) {
      	
      		// assigning target
      		target = interaction.options.getUser('target');
      		targetTag = target.tag;
      		targetID = codeBlock('yaml', `ID: ${target.id}`);
      		isGuildMember = false;

      		// get target's account creation date
            createdAt = { full: `${time(target.createdAt, 'F')}`, mini: `${time(target.createdAt, 'R')}` };

      	};

      	// assign special emojis to certain users
        function tagModifiers() {
          var emojiModifiers = "";
          if (!isGuildMember) {
            if (target.bot == true) {
              emojiModifiers += `${emojis.get('robot_face')}.`;
            };
          } else {
            if (target.user.bot == true) {
              emojiModifiers += `${emojis.get('robot_face')}.`;
            };
          };
          if (target.id == "285329659023851520") {
            emojiModifiers += `${emojis.get('white_heart')}.`;
          };
          emojiModifiers = emojiModifiers.replace(/\./g, ' ');
          emojiModifiers = emojiModifiers.replace(/ $/g, '')
          if (emojiModifiers == '') { return; };
          targetTag += ` [${emojiModifiers}]`;
        };

        tagModifiers();

      	if (!isGuildMember) {
      	embed = embedCreator('userinfoSuccess', { guildMember: `${isGuildMember}`, who: `${target}`, whoTag: `${targetTag}`, idBlock: `${targetID}`, createdAt: {full: `${createdAt.full}`, mini: `${createdAt.mini}`}, avatar: `${target.displayAvatarURL({ dynamic: true, size: 1024 })}` });
      	} else {
      	embed = embedCreator('userinfoSuccess', { guildMember: `${isGuildMember}`, who: `${target}`, whoTag: `${targetTag}`, idBlock: `${targetID}`, roles: `${roles}`, joinedAt: {full: `${joinedAt.full}`, mini: `${joinedAt.mini}`}, createdAt: {full: `${createdAt.full}`, mini: `${createdAt.mini}`}, avatar: `${target.displayAvatarURL({ dynamic: true, size: 1024 })}` });
      	};

      	await interaction.reply({ embeds: [embed] });

      	cooldown.add(interaction.user.id);
        	setTimeout(() => {
          	// rm cooldown after it has passed
          	cooldown.delete(interaction.user.id);
        	}, cooldownTime);
      	}
      } catch (error) {
        var errorEmbed = embedCreator("error", { error: `${error}` });
      	await interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
      	})
      	console.error(` \x1b[1;31m=> ERROR: \x1b[1;37m${error}`);
    	}
  	},
}
