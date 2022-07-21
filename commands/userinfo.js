const { SlashCommandBuilder, PermissionsBitField, codeBlock, time } = require('discord.js');

const decache = require('decache');
const emojis = require('node-emoji');

const { embedConstructor } = require('../lib/embeds.js');
const { log } = require('../lib/logging.js');

const { debug } = require('../config.json');

const cooldown = new Set();
const cooldownTime = 6000;
const cooldownEmbed = embedConstructor("cooldown", { cooldown: '6 seconds' });

module.exports = {
  data: new SlashCommandBuilder()
  .setName('userinfo')
  .setDescription('Get user profile from a Discord user')
  .addUserOption((option) => option.setName('target').setDescription('User to get user information from')),
  async execute(interaction) {
      if (cooldown.has(interaction.user.id)) {
      await interaction.reply({ embeds: [cooldownEmbed] });
      } else {

      	const executor = { obj: interaction.member, tag: interaction.user.tag, id: interaction.user.id }

      	var target = {}

      	var joinedAt
      	var createdAt

        var embed
        var sBadges = ""
        var iBadges = ""

        if (debug) log('genLog', { event: 'Commands > User Info', content: `Initialize`, extra: [`${executor.tag}`] })

      	if (!interaction.options.getMember('target') && !interaction.options.getUser('target')) {

      		target = { obj: executor.obj, tag: executor.tag, id: codeBlock('yaml', `ID: ${executor.id}`), member: true }

          target.obj.fetch()

          // NOTE: Unnecessary check?

          if (target.obj.avatar) {
            if (target.obj.avatar.slice(0,2) == 'a_') {
              target.avatar = target.obj.displayAvatarURL({ format: 'gif', dynamic: true, size: 1024 })
            } else {
              target.avatar = target.obj.displayAvatarURL({ dynamic: true, size: 1024 })
            }
          } else {
            if (target.obj.user.avatar.slice(0,2) == 'a_') {
              target.avatar = target.obj.displayAvatarURL({ format: 'gif', dynamic: true, size: 1024 })
            } else {
              target.avatar = target.obj.displayAvatarURL({ dynamic: true, size: 1024 })
            }
          }

      		target.roles = target.obj.roles.cache.map(r => r).toString().replace(/,/g, ' ')

          	joinedAt = { full: `${time(target.obj.joinedAt, 'f')}`, mini: `${time(target.obj.joinedAt, 'R')}` }
            createdAt = { full: `${time(target.obj.user.createdAt, 'f')}`, mini: `${time(target.obj.user.createdAt, 'R')}` }
      	
      	}

      	if (interaction.options.getMember('target')) {

          let userCache = interaction.options.getMember('target')

      		target = { obj: userCache, tag: userCache.user.tag, id: codeBlock('yaml', `ID: ${userCache.user.id}`), member: true }

          target.obj.fetch()

          // NOTE: Unnecessary check?

          if (target.obj.avatar) {
            if (target.obj.avatar.slice(0,2) == 'a_') {
              target.avatar = target.obj.displayAvatarURL({ format: 'gif', dynamic: true, size: 1024 })
            } else {
              target.avatar = target.obj.displayAvatarURL({ dynamic: true, size: 1024 })
            }
          } else {
            if (target.obj.user.avatar.slice(0,2) == 'a_') {
              target.avatar = target.obj.displayAvatarURL({ format: 'gif', dynamic: true, size: 1024 })
            } else {
              target.avatar = target.obj.displayAvatarURL({ dynamic: true, size: 1024 })
            }
          }

      		target.roles = target.obj.roles.cache.map(r => r).toString().replace(/,/g, ' ')

          	joinedAt = { full: `${time(target.obj.joinedAt, 'f')}`, mini: `${time(target.obj.joinedAt, 'R')}` }
            createdAt = { full: `${time(target.obj.user.createdAt, 'f')}`, mini: `${time(target.obj.user.createdAt, 'R')}` }

      	}

      	if (!interaction.options.getMember('target') && interaction.options.getUser('target')) {
      	
          let userCache = interaction.options.getUser('target')

          target = { obj: userCache, tag: userCache.tag, id: codeBlock('yaml', `ID: ${userCache.id}`), member: false }

          target.obj.fetch()

          // NOTE: Unnecessary check?

          if (target.obj.avatar.slice(0,2) == 'a_') {
            target.avatar = target.obj.displayAvatarURL({ format: 'gif', dynamic: true, size: 1024 })
          } else {
            target.avatar = target.obj.displayAvatarURL({ dynamic: true, size: 1024 })
          };

          if (target.obj.banner) {
            target.banner = target.obj.bannerURL({ extension: 'png', size: 1024 })
          }

            createdAt = { full: `${time(target.obj.createdAt, 'f')}`, mini: `${time(target.obj.createdAt, 'R')}` }

      	}

        if (debug) log('genLog', { event: 'Commands > User Info', content: `Target set`, extra: [`${target.tag}`,`${executor.tag}`] })

        function parseSpecialBadges() {
          let { specialBadges } = require('../config.json')
          sBadges = specialBadges[target.obj.id]
          decache('../config.json')
          if (!sBadges) { sBadges = ''; return; }
        }
        parseSpecialBadges();

        if (debug) log('genLog', { event: 'Commands > User Info', content: `Parsed special badges from target`, extra: [`${target.tag}`,`${executor.tag}`] })

        function parseInsightBadges() {
          let isOwner = false
          let isAdmin = false
            if (!target.member) {
            if (target.obj.bot) {
              iBadges += `<:bot:965220811424288789>.`
            }
          } else {
            if (target.obj.user.bot) {
              iBadges += `<:bot:965220811424288789>.`
            }
             if (target.obj.id == interaction.guild.ownerId) {
              iBadges += `<:guildOwner:965220811638202378>.`
              isOwner = true
            }
            if (interaction.guild.members.cache.get(target.obj.id).permissions.has([PermissionsBitField.Flags.ADMINISTRATOR]) && !isOwner) {
              iBadges += `<:guildAdmin:965220811248107550>.`
              isAdmin = true
            }
            if (interaction.guild.members.cache.get(target.obj.id).permissions.has([PermissionsBitField.Flags.MANAGE_MESSAGES]) && !isOwner && !isAdmin) {
              iBadges += `<:guildModerator:965220811571093545>.`
            }
          }
          iBadges = iBadges.replace(/\./g, ' ')
          iBadges = iBadges.replace(/ $/g, '')
          if (iBadges == '') { return; }
        };
        parseInsightBadges();

        if (debug) log('genLog', { event: 'Commands > User Info', content: `Parsed insight badges from target`, extra: [`${target.tag}`,`${executor.tag}`] })

      	if (!target.member) {
      	  embed = embedConstructor('userinfoSuccess', {
            guildMember: `${target.member}`,
            who: `${target.obj}`,
            whoTag: `${target.tag}`,
            idBlock: `${target.id}`,
            createdAt: {full: `${createdAt.full}`, mini: `${createdAt.mini}`},
            sBadges: `${sBadges}`,
            iBadges: `${iBadges}`,
            avatar: `${target.avatar}`
          })
      	} else {
      	  embed = embedConstructor('userinfoSuccess', {
            guildMember: `${target.member}`,
            who: `${target.obj}`,
            whoTag: `${target.tag}`,
            idBlock: `${target.id}`,
            roles: `${target.roles}`,
            joinedAt: {full: `${joinedAt.full}`, mini: `${joinedAt.mini}`},
            createdAt: {full: `${createdAt.full}`, mini: `${createdAt.mini}`},
            sBadges: `${sBadges}`,
            iBadges: `${iBadges}`,
            avatar: `${target.avatar}`
          })
      	}

      	interaction.reply({ embeds: [embed] })
        log('genLog', { event: 'Commands > User Info', content: 'Done.', extra: [`${target.tag}`,`${executor.tag}`] })

        cooldown.add(interaction.user.id)
        setTimeout(() => { cooldown.delete(interaction.user.id); }, cooldownTime)

      }
    },
  documentation: {
    name: 'userinfo',
    category: 'Information',
    description: 'Get user profile from a Discord user',
    syntax: '/userinfo target:[UserOptional]',
    cooldown: `${Math.round(cooldownTime / 1000)} seconds`,
    arguments: [
      { name: 'target', targetValue: 'User [Optional]', description: 'User to get user information on' }
    ]
  }
}
