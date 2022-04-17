// modules
const { SlashCommandBuilder, codeBlock, time } = require('@discordjs/builders');
const { Permissions } = require('discord.js');
const { embedCreator } = require('../tools/embeds.js');
const { debug } = require('../config.json');
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

      	// define other variables
      	var embed;
      	var isGuildMember;
        var sBadges = "";
        var iBadges = "";

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
          	joinedAt = { full: `${time(target.joinedAt, 'f')}`, mini: `${time(target.joinedAt, 'R')}` };
            createdAt = { full: `${time(target.user.createdAt, 'f')}`, mini: `${time(target.user.createdAt, 'R')}` };
      	
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
          	joinedAt = { full: `${time(target.joinedAt, 'f')}`, mini: `${time(target.joinedAt, 'R')}` };
            createdAt = { full: `${time(target.user.createdAt, 'f')}`, mini: `${time(target.user.createdAt, 'R')}` };

      	};

      	// if member is not guild member
      	if (interaction.options.getMember('target') == null && interaction.options.getUser('target') != null) {
      	
      		// assigning target
      		target = interaction.options.getUser('target');
      		targetTag = target.tag;
      		targetID = codeBlock('yaml', `ID: ${target.id}`);
      		isGuildMember = false;

      		// get target's account creation date
            createdAt = { full: `${time(target.createdAt, 'f')}`, mini: `${time(target.createdAt, 'R')}` };

      	};

      	// assign special emojis to certain users
        function specialBadges() {
          if (target.id == '285329659023851520') {
            sBadges += `<:botDev:965168985723265044>.`;
            sBadges += `<:heart:965168986016862208>.`;
          };
          if (target.id == '379317501072375811') {
            sBadges += `<:kekw:957209610840862730>.`;
          };
          if (target.id == '807884207589818439') {
            sBadges += '<:skull:964875094797197373>.'
          };
          if (target.id == '858693971709657108') {
            sBadges += `<:yash:965169013762191430>.`
          };
          if (target.id == '942049062071443496') {
            sBadges += `<:tree:965173753476681748>.`
          }
          sBadges = sBadges.replace(/\./g, ' ');
          sBadges = sBadges.replace(/ $/g, '');
          if (sBadges == '') { return; };
        };
        specialBadges();

        function insightBadges() {
          var isOwner = false;
          var isAdmin = false;
            if (!isGuildMember) {
            if (target.bot == true) {
              iBadges += `<:bot:965168985740025876>.`;
            };
          } else {
            if (target.user.bot == true) {
              iBadges += `<:bot:965168985740025876>.`;
            };
             if (target.id == interaction.guild.ownerId) {
              iBadges += `<:guildOwner:965168985568071710>.`
              isOwner = true;
            };
            if (interaction.guild.members.cache.get(target.id).permissions.has([Permissions.FLAGS.ADMINISTRATOR]) && !isOwner) {
              iBadges += `<:guildAdmin:965168985442254868>.`
              isAdmin = true;
            };
            if (interaction.guild.members.cache.get(target.id).permissions.has([Permissions.FLAGS.MANAGE_MESSAGES]) && !isOwner && !isAdmin) {
              iBadges += `<:guildModerator:965168985589051412>.`
            };
          };
          iBadges = iBadges.replace(/\./g, ' ');
          iBadges = iBadges.replace(/ $/g, '');
          if (iBadges == '') { return; };
        };
        insightBadges();

      	if (!isGuildMember) {
      	embed = embedCreator('userinfoSuccess', { guildMember: `${isGuildMember}`, who: `${target}`, whoTag: `${targetTag}`, idBlock: `${targetID}`, createdAt: {full: `${createdAt.full}`, mini: `${createdAt.mini}`}, sBadges: `${sBadges}`, iBadges: `${iBadges}`, avatar: `${target.displayAvatarURL({ dynamic: true, size: 1024 })}` });
      	} else {
      	embed = embedCreator('userinfoSuccess', { guildMember: `${isGuildMember}`, who: `${target}`, whoTag: `${targetTag}`, idBlock: `${targetID}`, roles: `${roles}`, joinedAt: {full: `${joinedAt.full}`, mini: `${joinedAt.mini}`}, createdAt: {full: `${createdAt.full}`, mini: `${createdAt.mini}`}, sBadges: `${sBadges}`, iBadges: `${iBadges}`, avatar: `${target.displayAvatarURL({ dynamic: true, size: 1024 })}` });
      	};

      	await interaction.reply({ embeds: [embed] });

      	cooldown.add(interaction.user.id);
        	setTimeout(() => {
          	// rm cooldown after it has passed
          	cooldown.delete(interaction.user.id);
        	}, cooldownTime);
      	}
      } catch (error) {
        if (debug) { errorEmbed = embedCreator("error", { error: `${error}` }) } else { errorEmbed = embedCreator("errorNoDebug", {}) };
      	await interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
      	})
      	console.error(` \x1b[1;31m=> ERROR: \x1b[1;37m${error}`);
    	}
  	},
}
