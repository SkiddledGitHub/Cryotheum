/**
 * @license
 * @copyright Copyright 2022 ZenialDev
 *
 * This file is part of Cryotheum.
 * Cryotheum is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * Cryotheum is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; 
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with the Cryotheum source code. 
 * If not, see <https://www.gnu.org/licenses/>.
 *
 */

// discord.js modules
const {
  SlashCommandBuilder,
  PermissionsBitField,
  GuildMember,
  Role,
  GuildMemberRoleManager,
  Guild,
  GuildBanManager,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle
} = require('discord.js');

// custom modules
const { embedConstructor } = require('../lib/embeds.js');
const { log } = require('../lib/logging.js');

// data
const { debug, botID } = require('../config.json');

// set cooldown
const cooldown = new Set();
const cooldownTime = 6000;
const cooldownEmbed = embedConstructor("cooldown", { cooldown: '6 seconds' });

module.exports = {
  data: new SlashCommandBuilder()
  .setName('ban')
  .setDescription('Ban a person from the Disiscordcord server.')
  .addUserOption((option) => option.setName('target').setDescription('Target user to ban').setRequired(true))
  .addStringOption((option) => option.setName('reason').setDescription('Reason why you banned this user').setRequired(false)),
  async execute(interaction) {
      // cooldown management
      if (cooldown.has(interaction.user.id)) {
      await interaction.reply({ embeds: [cooldownEmbed] })
      } else {

        // variables
        var target = {}
        var reason

        // constants
        const executor = { obj: interaction.member, tag: interaction.user.tag, id: interaction.user.id, guild: interaction.guild }
        const botUser = executor.guild.members.me

        if (debug) log('genLog', { event: 'Commands > Ban', content: `Initialize`, extra: [`${executor.tag}`] })

        // ui
        const buttonRow = new ActionRowBuilder()
          .addComponents( 
            new ButtonBuilder().setLabel('Yes').setCustomId('yesBan').setStyle(ButtonStyle.Success).setEmoji({ id: '986186601417822228' }), 
            new ButtonBuilder().setLabel('No').setCustomId('noBan').setStyle(ButtonStyle.Danger).setEmoji({ id: '986186598444056617' }),
          );

        // get reason
        if (!interaction.options.getString('reason')) {
          reason = `No reason given - Executor: ${executor.tag}`
        } else {
          reason = `${interaction.options.getString('reason')} - Executor: ${executor.tag}`
        };
        if (debug) log('genLog', { event: 'Commands > Ban', content: `Ban reason set`, extra: [`Reason: ${reason}`,`${executor.tag}`] })

        // user not in server
        if (!interaction.options.getMember('target')) {

          let userCache = interaction.options.getUser('target')

          // set target
          target = { obj: userCache, tag: userCache.tag, id: userCache.id, member: false }

          await executor.guild.bans.fetch({ cache: false }).then((value) => {
            bannedUser = value.get(target.id)
          });

          // already banned
           if (bannedUser) {

            // set embed
            let embed = embedConstructor("banFailed", { who: `${target.tag}`, reason: `${target.tag} is already banned!` })

            // throw
            if (debug) log('genWarn', { event: 'Commands > Ban', content: `Failed`, extra: [`Executor: ${executor.tag}`, `Target: ${target.tag}`], cause: 'Already banned' })
            await interaction.reply({ embeds: [embed] })
            log('genLog', { event: 'Commands > Ban', content: `Done${debug ? '' : ' with suppressed warnings'}.`, extra: [`Executor: ${executor.tag}`, `Target: ${target.tag}`] })
            return

           }

        // user in server
        } else if (interaction.options.getMember('target')) {

          let userCache = interaction.options.getMember('target')

          // set target
          target = { obj: userCache, tag: userCache.user.tag, id: userCache.user.id, member: true };
        
        }

        // check target id

        // target is bot
        if (target.id == botID) {

          // set embed
          let embed = embedConstructor('banFailed', { who: `${target.tag}`, reason: 'You cannot ban the bot itself!' })

          // throw
          if (debug) log('genWarn', { event: 'Commands > Ban', content: 'Failed.', extra: [`Executor: ${executor.tag}`, `Target: ${target.tag}`], cause: 'Executor tried to ban the bot'})
          await interaction.reply({ embeds: [embed] })
          log('genLog', { event: 'Commands > Ban', content: `Done${debug ? '' : ' with suppressed warnings.'}.`, extra: [`Executor: ${executor.tag}`, `Target: ${target.tag}`] })
          return

        }

        // executor checking
        if (target.id == executor.id) {

          // set embed
          let embed = embedConstructor('banFailed', { who: `${target.tag}`, reason: 'You cannot ban yourself!' })

          // throw
          if (debug) log('genWarn', { event: 'Commands > Ban', content: `Failed.`, extra: [`Executor: ${executor.tag}`], cause: 'Executor tried to ban themselves'})
          await interaction.reply({ embeds: [embed] })
          log('genLog', { event: 'Commands > Ban', content: `Done${debug ? '' : ' with suppressed warnings.'}.`, extra: [`Executor: ${executor.tag}`] })
          return

        }

        if (debug) log('genLog', { event: 'Commands > Ban', content: `Target set`, extra: [`${target.tag}`,`${target.member ? 'In guild' : 'Outside guild'}`] })

        // role pos checking part 1

        // member check
        if (target.member) {
          // bot lower than target
          if (botUser.roles.highest.comparePositionTo(target.obj.roles.highest) < 0) {
              
            // set embed
            let embed = embedConstructor('banFailed', { who: `${target.tag}`, reason: `The bot\'s highest role (${botUser.roles.highest}) is lower than the target\'s highest role (${target.obj.roles.highest})` })

            // throw
            if (debug) log('genWarn', { event: 'Commands > Ban', content: `Failed.`, extra: [`Executor: ${executor.tag}`, `Target: ${target.tag}`], cause: 'Role position mismatch (Target > Bot)'})
            await interaction.reply({ embeds: [embed] })
            log('genLog', { event: 'Commands > Ban', content: `Done${debug ? '' : ' with suppressed warnings.'}.`, extra: [`Executor: ${executor.tag}`, `Target: ${target.tag}`] })
            return

          // bot equal target
          } else if (botUser.roles.highest.comparePositionTo(target.obj.roles.highest) == 0) {

            // set embed
            let embed = embedConstructor('banFailed', { who: `${target.tag}`, reason: `The bot\'s highest role is equal to the target\'s highest role (${target.obj.roles.highest})` });

            // throw
            if (debug) log('genWarn', { event: 'Commands > Ban', content: `Failed.`, extra: [`Executor: ${executor.tag}`, `Target: ${target.tag}`], cause: 'Role position mismatch (Target = Bot)'})
            await interaction.reply({ embeds: [embed] })
            log('genLog', { event: 'Commands > Ban', content: `Done${debug ? '' : ' with suppressed warnings.'}`, extra: [`Executor: ${executor.tag}`, `Target: ${target.tag}`] })
            return

          }
        }

        // bot no ban perm
        if (!botUser.permissions.has([PermissionsBitField.Flags.BAN_MEMBERS])) {

          // set embed
          let embed = embedConstructor('banFailed', { who: `${target.tag}`, reason: 'The bot does not have the permission to ban members.' });

          // throw
          if (debug) log('genWarn', { event: 'Commands > Ban', content: `Failed.`, extra: [`Executor: ${executor.tag}`, `Target: ${target.tag}`], cause: 'Permission mismatch (Ban Members missing from Bot)' })
          await interaction.reply({ embeds: [embed] })
          log('genLog', { event: 'Commands > Ban', content: `Done${debug ? '' : ' with suppressed warnings'}.`, extra: [`Executor: ${executor.tag}`, `Target: ${target.tag}`] })
          return

        }

        // user is owner check
        if (!executor.id == executor.guild.ownerId) {

          // role pos checking part 2

          // member check
          if (target.member) {
            // executor lower than target
            if (executor.obj.roles.highest.comparePositionTo(target.obj.roles.highest) < 0) {
              
              // set embed
              let embed = embedConstructor('banFailed', { who: `${target.tag}`, reason: `Your highest role (${executor.obj.roles.highest}) is lower than target\'s highest role (${target.obj.roles.highest})` })

              // throw
              if (debug) log('genWarn', { event: 'Commands > Ban', content: `Failed.`, extra: [`Executor: ${executor.tag}`, `Target: ${target.tag}`], cause: 'Role position mismatch (Target > Executor)' })
              await interaction.reply({ embeds: [embed] })
              log('genLog', { event: 'Commands > Ban', content: `Done${debug ? '' : ' with suppressed warnings'}.`, extra: [`Executor: ${executor.tag}`, `Target: ${target.tag}`] })
              return

            // executor equal target
            } else if (executor.obj.roles.highest.comparePositionTo(target.obj.roles.highest) == 0) {

              // set embed
              let embed = embedConstructor('banFailed', { who: `${target.tag}`, reason: `Your highest role is equal to the target\'s highest role (${target.obj.roles.highest})` })

              // throw
              if (debug) log('genWarn', { event: 'Commands > Ban', content: `Failed.`, extra: [`Executor: ${executor.tag}`, `Target: ${target.tag}`], cause: 'Role position mismatch (Target = Executor)' })
              await interaction.reply({ embeds: [embed] })
              log('genLog', { event: 'Commands > Ban', content: `Done${debug ? '' : ' with suppressed warnings'}.`, extra: [`Executor: ${executor.tag}`, `Target: ${target.tag}`] })
              return

            }
          }

          // perm check

          // executor no ban perm
          if (!interaction.memberPermissions.has([PermissionsBitField.Flags.BAN_MEMBERS])) {

            // set embed
            let embed = embedConstructor('banFailed', { who: `${target.tag}`, reason: 'You do not have the permission to ban members.' })

            // throw
            if (debug) log('genWarn', { event: 'Commands > Ban', content: `Failed`, extra: [`Executor: ${executor.tag}`, `Target: ${target.tag}`], cause: 'Permission mismatch (Ban Members missing from Executor)' })
            await interaction.reply({ embeds: [embed] })
            log('genLog', { event: 'Commands > Ban', content: `Done${debug ? '' : ' with suppressed warnings'}.`, extra: [`Executor: ${executor.tag}`, `Target: ${target.tag}`] })
            return

          }

        }

        // construct confirm embed
        let confirmationEmbed = embedConstructor('banConfirmation', { who: `${target.tag}` })

        // send confirm
        await interaction.reply({ embeds: [confirmationEmbed], components: [buttonRow] })
        if (debug) log('genLog', { event: 'Commands > Ban', content: `Embed spawned`, extra: [`Executor: ${executor.tag}`, `Target: ${target.tag}`] })

        // collector
        const filter = i => i.customId === 'yesBan' || i.customId === 'noBan'
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 })
        if (debug) log('genLog', { event: 'Commands > Ban', content: `Component collector initialized` })

        collector.on('collect', async i => {
          if (i.user.id === executor.id) {
            if (i.customId === 'yesBan') {
              await i.deferUpdate()
              if (debug) log('genLog', { event: 'Commands > Ban', content: `Proceeded`, extra: [`Executor: ${executor.tag}`, `Target: ${target.tag}`] })

              // create ban then edit with success embed
              await executor.guild.bans.create(target.obj, {reason})
              if (debug) log('genLog', { event: 'Commands > Ban', content: `Banned`, extra: [`Executor: ${executor.tag}`, `Target: ${target.tag}`, `With reason: ${reason}`] })
              let successEmbed = embedConstructor('banSuccess', { who: `${target.tag}`, reason: `${reason}` })

              log('genLog', { event: 'Commands > Ban', content: `Done.`, extra: [`Executor: ${executor.tag}`, `Target: ${target.tag}`] })
              await i.editReply({ embeds: [successEmbed], components: [] });

              // kills the collector
              if (debug) log('genLog', { event: 'Commands > Ban', content: `Component collector killed` })
              collector.stop()

            } else if (i.customId === 'noBan') {
              await i.deferUpdate()
              if (debug) log('genLog', { event: 'Commands > Ban', content: `Cancelled`, extra: [`Executor: ${executor.tag}`, `Target: ${target.tag}`] })

              // edit with cancelled embed
              let cancelledEmbed = embedConstructor('banCancel', { who: `${target.tag}` })

              log('genLog', { event: 'Commands > Ban', content: `Done.`, extra: [`Executor: ${executor.tag}`, `Target: ${target.tag}`] })
              await i.editReply({ embeds: [cancelledEmbed], components: [] })

              // kills the collector
              if (debug) log('genLog', { event: 'Commands > Ban', content: `Component collector killed` })
              collector.stop()

            }

          } else {

            // different member tries to answer? block
            if (debug) log('genWarn', { event: 'Commands > Ban', content: `Interaction owner mismatch`, extra: [`Expected: ${executor.tag}`, `Got: ${i.user.tag}`] })
            let notForUserEmbed = embedConstructor('notForUser', {})
            await i.reply({ embeds: [notForUserEmbed], ephemeral: true })
            
          }

        })

        // cooldown management
        cooldown.add(executor.id)
        setTimeout(() => { cooldown.delete(executor.id); }, cooldownTime)
        
        }
    },
  documentation: {
    name: 'ban',
    category: 'Moderation',
    description: 'Ban a person from the Discord server.',
    syntax: '/ban target:[User] reason:[StringOptional]',
    cooldown: `${Math.round(cooldownTime / 1000)} seconds`,
    arguments: [
      { name: 'target', targetValue: 'User', description: 'Target user to ban.' },
      { name: 'reason', targetValue: 'String [Optional]', description: 'Reason why you banned this user.' }
    ]
  }
}