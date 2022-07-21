const {
  SlashCommandBuilder,
  PermissionsBitField,
  GuildMember,
  Role,
  GuildMemberRoleManager,
  Guild,
  GuildBanManager,
  Collection
} = require('discord.js')

const { embedConstructor } = require('../lib/embeds.js');
const { log } = require('../lib/logging.js');

const { debug } = require('../config.json');

const cooldown = new Set();
const cooldownTime = 6000;
const cooldownEmbed = embedConstructor("cooldown", { cooldown: '6 seconds' });

module.exports = {
  data: new SlashCommandBuilder()
  .setName('unban')
  .setDescription('Unban a person from the Discord server.')
  .addUserOption((option) => option.setName('target').setDescription('Target user to unban').setRequired(true))
  .addStringOption((option) => option.setName('reason').setDescription('Reason why you unbanned this user').setRequired(false)),
  async execute(interaction) {
      if (cooldown.has(interaction.user.id)) {
      await interaction.reply({ embeds: [cooldownEmbed] });
      } else {

        var target = {}
        var reason
        var bannedUser

        const executor = { obj: interaction.member, tag: interaction.user.tag, guild: interaction.guild }
        const botUser = executor.guild.members.me

        if (debug) log('genLog', { event: 'Commands > Unban', content: `Initialized`, extra: [`${executor.tag}`] })

        if (!interaction.options.getString('reason')) {
          reason = `No reason provided - Executor: ${executor.tag}`
        } else {
          reason = interaction.options.getString('reason')
        }
        if (debug) log('genLog', { event: 'Commands > Unban', content: `Unban reason set`, extra: [`${reason}`,`${executor.tag}`] })

        if (!interaction.options.getMember('target')) {

          let userCache = interaction.options.getUser('target')

          target = { obj: userCache, tag: userCache.tag, id: userCache.id }

          await executor.guild.bans.fetch({ cache: false }).then((value) => {
            bannedUser = value.get(target.id)
          })

           if (!bannedUser) {
            if (debug) log('genWarn', { event: 'Commands > Unban', content: `Failed.`, cause: 'Not banned', extra: [`${target.tag}`,`${executor.tag}`] })
            const embed = embedConstructor("unbanFailed", { who: `${target.tag}`, reason: `${target.tag} is not banned.` })
            interaction.reply({ embeds: [embed] })
            log('genLog', { event: 'Commands > Unban', content: `Done${debug ? '' : ' with suppressed warnings'}.`, extra: [`${target.tag}`,`${executor.tag}`] })
            return
          }

        } else if (interaction.options.getMember('target')) {

          let userCache = interaction.options.getMember('target')

          target = { obj: userCache, tag: userCache.user.tag }

          if (debug) log('genWarn', { event: 'Commands > Unban', content: `Failed.`, cause: 'Not banned', extra: [`${target.tag}`,`${executor.tag}`] })
          const embed = embedConstructor("unbanFailed", { who: `${target.tag}`, reason: `${target.tag} is not banned.` })
          interaction.reply({ embeds: [embed] })
          log('genLog', { event: 'Commands > Unban', content: `Done${debug ? '' : ' with suppressed warnings'}.`, extra: [`${target.tag}`,`${executor.tag}`] })
          return
        }

        if (!interaction.memberPermissions.has([PermissionsBitField.Flags.BAN_MEMBERS])) {

            if (debug) log('genWarn', { event: 'Commands > Unban', content: `Failed.`, cause: 'Permission mismatch (Ban Members missing from executor)', extra: [`${target.tag}`,`${executor.tag}`] })
            const embed = embedConstructor("unbanFailed", { who: `${target.tag}`, reason: 'You do not have permission to unban members!' })
            interaction.reply({ embeds: [embed] })
            log('genLog', { event: 'Commands > Unban', content: `Done${debug ? '' : ' with suppressed warnings'}.`, extra: [`${target.tag}`,`${executor.tag}`] })
            return
        }

        if (!botUser.permissions.has([PermissionsBitField.Flags.BAN_MEMBERS])) {

            if (debug) log('genWarn', { event: 'Commands > Unban', content: `Failed.`, cause: 'Permission mismatch (Ban Members missing from bot)', extra: [`${target.tag}`,`${executor.tag}`] })
            let embed = embedConstructor("unbanFailed", { who: `${target.tag}`, reason: 'The bot does not have permission to unban members!' })
            interaction.reply({ embeds: [embed] })
            log('genLog', { event: 'Commands > Unban', content: `Done${debug ? '' : ' with suppressed warnings'}.`, extra: [`${target.tag}`,`${executor.tag}`] })
            return
        }

        try { 
          executor.guild.bans.remove(target.obj, reason);
          if (debug) log('genLog', { event: 'Commands > Unban', content: `Unbanned`, extra: [`${reason}`,`${target.tag}`,`${executor.tag}`] })
          
          let embed = embedConstructor("unbanSuccess", { who: `${target.tag}`, reason: `${reason}` })
          interaction.reply({ embeds: [embed] })
          log('genLog', { event: 'Commands > Unban', content: 'Done.', extra: [`${target.tag}`,`${executor.tag}`] })

        } catch (error) { 

          if (debug) log('cmdErr', { event: 'Unban', content: `Failed.`, cause: `${error.name}: ${error.message}`, extra: [`${target.tag}`,`${executor.tag}`] })
          let embed
          if (debug) { embed = embedConstructor("error", { error: `${error}` }) } else { embed = embedConstructor("errorNoDebug", {}) };
          interaction.reply({ embeds: [embed] })
          log('genLog', { event: 'Commands > Unban', content: `Done${debug ? '' : ' with suppressed errors'}.`, extra: [`${target.tag}`,`${executor.tag}`] })
          return
        }

        cooldown.add(interaction.user.id)
        setTimeout(() => { cooldown.delete(interaction.user.id); }, cooldownTime); }
  },
  documentation: {
    name: 'unban',
    category: 'Moderation',
    description: 'Unban a person from the Discord server.',
    syntax: '/unban target:[User] reason:[StringOptional]',
    cooldown: `${Math.round(cooldownTime / 1000)} seconds`,
    arguments: [
      { name: 'target', targetValue: 'User [ID]', description: 'Target user to unban' },
      { name: 'reason', targetValue: 'String [Optional]', description: 'Reason why you unbanned this user' }
    ]
  }
}
