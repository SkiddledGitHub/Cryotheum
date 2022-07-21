const {
  SlashCommandBuilder,
  PermissionsBitField,
  GuildMember,
  Role,
  GuildMemberRoleManager,
  Guild,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle
} = require('discord.js')

const { embedConstructor } = require('../lib/embeds.js');
const { log } = require('../lib/logging.js');

const { debug, botID } = require('../config.json');

const cooldown = new Set();
const cooldownTime = 4000;
const cooldownEmbed = embedConstructor("cooldown", { cooldown: '4 seconds' });


module.exports = {
  data: new SlashCommandBuilder()
  .setName('kick')
  .setDescription('Kick a member from the Discord server')
  .addUserOption((option) => option.setName('target').setDescription('Target user to kick').setRequired(true))
  .addStringOption((option) => option.setName('reason').setDescription('Reason why you kicked this user').setRequired(false)),
  async execute(interaction) {
    if (cooldown.has(interaction.user.id)) {
    await interaction.reply({ embeds: [cooldownEmbed] });
      } else {

        var target = {}
        var reason

        const executor = { obj: interaction.member, tag: interaction.user.tag, id: interaction.user.id, guild: interaction.guild }
        const botUser = executor.guild.members.me

        const buttonRow = new ActionRowBuilder().addComponents( 
          new ButtonBuilder().setLabel('Yes').setCustomId('yesKick').setStyle(ButtonStyle.Success).setEmoji({ id: '986186601417822228' }), 
          new ButtonBuilder().setLabel('No').setCustomId('noKick').setStyle(ButtonStyle.Danger).setEmoji({ id: '986186598444056617' }),
        )

        if (debug) log('genLog', { event: 'Commands > Kick', content: `Initialize`, extra: [`${executor.tag}`] })

        if (!interaction.options.getString('reason')) {
            reason = `No reasons given - Executor: ${executor.tag}`
        } else {
            reason = `${interaction.options.getString('reason')} - Executor: ${executor.tag}`
        }
        if (debug) log('genLog', { event: 'Commands > Kick', content: `Kick reason set`, extra: [`${reason}`, `${executor.tag}`] })

        if (!interaction.options.getMember('target')) {

          let userCache = interaction.options.getUser('target')

          target = { obj: userCache, tag: userCache.tag }

          if (debug) log('genWarn', { event: 'Commands > Kick', content: `Failed.`, cause: 'Target is not present in guild.', extra: [`${target.tag}`,`${executor.tag}`] })
          let embed = embedConstructor('kickFailed', { who: target.tag, reason: 'Target is not in the server!' })
          interaction.reply({ embeds: [embed] })
          log('genLog', { event: 'Commands > Kick', content: `Done${debug ? '' : ' with suppressed warnings'}.`, extra: [`${target.tag}`,`${executor.tag}`] })
          return

        } else {

          let userCache = interaction.options.getMember('target')

          target = { obj: userCache, tag: userCache.user.tag, id: userCache.user.id }

        }

        if (debug) log('genLog', { event: 'Commands > Kick', content: `Kick target set`, extra: [`${target.tag}`,`${executor.tag}`] })

        if (target.id === botID) {

          let embed = embedConstructor('kickFailed', { who: target.tag, reason: 'You cannot kick the bot itself!' })
          if (debug) log('genWarn', { event: 'Commands > Kick', content: `Failed.`, cause: 'Executor tried to kick the bot.', extra: [`${target.tag}`,`${executor.tag}`] })
          interaction.reply({ embeds: [embed] })
          log('genLog', { event: 'Commands > Kick', content: `Done${debug ? '' : ' with suppressed warnings'}.`, extra: [`${target.tag}`,`${executor.tag}`] })
          return

        }

        if (target.id == executor.id) {        

          let embed = embedConstructor('kickFailed', { who: target.tag, reason: 'You cannot kick yourself!' })
          if (debug) log('genWarn', { event: 'Commands > Kick', content: `Failed.`, cause: 'Executor tried to kick themselves.', extra: [`${target.tag}`,`${executor.tag}`] })
          interaction.reply({ embeds: [embed] })
          log('genLog', { event: 'Commands > Kick', content: `Done${debug ? '' : ' with suppressed warnings'}.`, extra: [`${target.tag}`,`${executor.tag}`] })
          return

        }

        if (botUser.roles.highest.comparePositionTo(target.obj.roles.highest) < 0) {

          let embed = embedConstructor('kickFailed', { who: target.tag, reason: `The bot\'s highest role (${botUser.roles.highest}) is lower than target\'s highest role (${target.obj.roles.highest})` })
          if (debug) log('genWarn', { event: 'Commands > Kick', content: `Failed.`, cause: 'Role position mismatch (Target > Bot)', extra: [`${target.tag}`,`${executor.tag}`] })
          await interaction.reply({ embeds: [embed] })
          log('genLog', { event: 'Commands > Kick', content: `Done${debug ? '' : ' with suppressed warnings'}.`, extra: [`${target.tag}`,`${executor.tag}`] })
          return
          
        } else if (botUser.roles.highest.comparePositionTo(target.obj.roles.highest) == 0) {

          let embed = embedConstructor('kickFailed', { who: target.tag, reason: `The bot\'s highest role is equal to the target\'s highest role (${botUser.obj.roles.highest})` })
          if (debug) log('genWarn', { event: 'Commands > Kick', content: `Failed.`, cause: 'Role position mismatch (Target = Bot)', extra: [`${target.tag}`,`${executor.tag}`] })
          await interaction.reply({ embeds: [embed] })
          log('genLog', { event: 'Commands > Kick', content: `Done${debug ? '' : ' with suppressed warnings'}.`, extra: [`${target.tag}`,`${executor.tag}`] })
          return

        }

        if (!botUser.permissions.has([PermissionsBitField.Flags.KICK_MEMBERS])) {

          let embed = embedConstructor('kickFailed', { who: `${target.tag}`, reason: 'The bot does not have the permission to kick members.' })
          if (debug) log('genWarn', { event: 'Commands > Kick', content: `Failed.`, cause: 'Permission mismatch (Ban Members missing from bot)', extra: [`${target.tag}`,`${executor.tag}`] })
          await interaction.reply({ embeds: [embed] })
          log('genLog', { event: 'Commands > Kick', content: `Done${debug ? '' : ' with suppressed warnings'}.`, extra: [`${target.tag}`,`${executor.tag}`] })
          return

        }

        if (!executor.id == executor.guild.ownerId) {

          if (executor.obj.roles.highest.comparePositionTo(target.obj.roles.highest) < 0) {

            let embed = embedConstructor('kickFailed', { who: target.tag, reason: `Your highest role is lower than the target\'s highest role (${botUser.roles.highest})` })
            if (debug) log('genWarn', { event: 'Commands > Kick', content: `Failed.`, cause: 'Role position mismatch (Target > Executor)', extra: [`${target.tag}`,`${executor.tag}`] })
            await interaction.reply({ embeds: [embed] })
            log('genLog', { event: 'Commands > Kick', content: `Done${debug ? '' : ' with suppressed warnings'}.`, extra: [`${target.tag}`,`${executor.tag}`] })
            return

          } else if (executor.obj.roles.highest.comparePositionTo(target.obj.roles.highest) == 0) {

            let embed = embedConstructor('kickFailed', { who: target.tag, reason: `Your highest role is equal to the target\'s highest role (${botUser.roles.highest})` })
            if (debug) log('genWarn', { event: 'Commands > Kick', content: `Failed.`, cause: 'Role position mismatch (Target = Executor)', extra: [`${target.tag}`,`${executor.tag}`] })
            await interaction.reply({ embeds: [embed] })
            log('genLog', { event: 'Commands > Kick', content: `Done${debug ? '' : ' with suppressed warnings'}.`, extra: [`${target.tag}`,`${executor.tag}`] })
            return

          }

          if (!interaction.memberPermissions.has([PermissionsBitField.Flags.KICK_MEMBERS])) {

            let embed = embedConstructor('kickFailed', { who: `${target.tag}`, reason: 'You do not have the permission to kick members.' });
            if (debug) log('genWarn', { event: 'Commands > Kick', content: `Failed.`, cause: 'Permission mismatch (Ban Members missing from executor)', extra: [`${target.tag}`,`${executor.tag}`] })
            await interaction.reply({ embeds: [embed] })
            log('genLog', { event: 'Commands > Kick', content: `Done${debug ? '' : ' with suppressed warnings'}.`, extra: [`${target.tag}`,`${executor.tag}`] })
            return

          }
        }

        let confirmationEmbed = embedConstructor('kickConfirmation', { who: `${target.tag}` })

        await interaction.reply({ embeds: [confirmationEmbed], components: [buttonRow] })
        if (debug) log('genLog', { event: 'Commands > Kick', content: `Embed spawned`, extra: [`${target.tag}`,`${executor.tag}`] })

        const filter = i => i.customId === 'yesKick' || i.customId === 'noKick'
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 })
        if (debug) log('genLog', { event: 'Commands > Kick', content: `Component collector initialized` })

        collector.on('collect', async i => {
          if (i.user.id === executor.id) {
            if (i.customId === 'yesKick') {
              await i.deferUpdate()
              if (debug) log('genLog', { event: 'Commands > Kick', content: `Proceeded`, extra: [`${target.tag}`,`${executor.tag}`] })

              await executor.guild.kick(target, {reason})
              if (debug) log('genLog', { event: 'Commands > Kick', content: `Kicked`, extra: [`${reason}`,`${target.tag}`,`${executor.tag}`] })
              let successEmbed = embedConstructor('kickSuccess', { who: `${target.tag}`, reason: `${reason}` })

              await i.editReply({ embeds: [successEmbed], components: [] })
              log('genLog', { event: 'Commands > Kick', content: 'Done.', extra: [`${target.tag}`,`${executor.tag}`] })

              if (debug) log('genLog', { event: 'Commands > Ban', content: `Component collector was killed` })
              collector.stop()

            } else if (i.customId === 'noKick') {
              await i.deferUpdate()
              if (debug) log('genLog', { event: 'Commands > Kick', content: `Cancelled`, extra: [`${target.tag}`,`${executor.tag}`] })

              let cancelledEmbed = embedConstructor('kickCancel', { who: `${target.tag}` })

              await i.editReply({ embeds: [cancelledEmbed], components: [] })
              log('genLog', { event: 'Commands > Kick', content: 'Done.', extra: [`${target.tag}`,`${executor.tag}`] })

              if (debug) log('genLog', { event: 'Commands > Ban', content: `Component collector was killed` })
              collector.stop()

            }

          } else {

            if (debug) log('genWarn', { event: 'Commands > Ban', content: `Interaction owner mismatch`, extra: [`Expected: ${executor.tag}`, `Got: ${i.user.tag}`] })
            let notForUserEmbed = embedConstructor('notForUser', {})
            await i.reply({ embeds: [notForUserEmbed], ephemeral: true })
            
          }

        })


        cooldown.add(interaction.user.id)
        setTimeout(() => { cooldown.delete(interaction.user.id); }, cooldownTime)
        
        }
    },
    documentation: {
      name: 'kick',
      category: 'Moderation',
      description: 'Kick a member with a reason (optional).',
      syntax: '/kick target:[User] reason:[StringOptional]',
      cooldown: `${Math.round(cooldownTime / 1000)} seconds`,
      arguments: [
        { name: 'target', targetValue: 'User', description: 'The target to kick.' },
        { name: 'reason', targetValue: 'String [Optional]', description: 'The reason for kicking the target member.' }
      ]
    }
}
