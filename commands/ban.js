const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, ButtonInteraction } = require('discord.js');
const { Permissions, GuildMember, Role, GuildMemberRoleManager, Guild, GuildBanManager } = require('discord.js')

const cooldown = new Set();
const cooldownTime = 6000;

module.exports = {
  data: new SlashCommandBuilder()
  .setName('ban')
  .setDescription('Ban a person from the Discord server.')
  .addUserOption((option) => option.setName('target').setDescription('Target user to ban').setRequired(true))
  .addStringOption((option) => option.setName('reason').setDescription('Reason why you banned this user').setRequired(false)),
  async execute(interaction) {
      try {
      if (cooldown.has(interaction.user.id)) {
      await interaction.reply({ 
          content: `You are under cooldown! (Default cooldown is 6s)`, 
          ephemeral: true 
        });
      } else {
        var target = "";
        var bannedMember = "";
        var reason = "";
        var history = 0;
        const executor = interaction.member;
        if (interaction.options.getString('reason') == null) {
          reason = `Executor: ${executor.user.tag}`
        } else {
          reason = interaction.options.getString('reason');
        }
        if (interaction.options.getMember('target') == null) {
            target = interaction.options.getUser('target');
            bannedMember = target.tag;
        } else if (interaction.options.getMember('target') != null) {
            target = interaction.options.getMember('target');   
            bannedMember = target.user.tag;
            if (target.user.id == "413250765629423636") {
              await interaction.reply({
                content: `I cannot ban myself!`
              })
              console.log(`\x1b[1;33m==> WARNING: \x1b[1;37m${executor.user.tag} tried to ban the bot.`)
              return;
            };
            if (target.user.id == executor.user.id) {
              await interaction.reply({
                content: `You cannot ban yourself!`
              })
              console.log(`\x1b[1;33m==> WARNING: \x1b[1;37m${executor.user.tag} tried to ban themselves.`)
              return;
            };
            if (executor.guild.me.roles.highest.comparePositionTo(target.roles.highest) < 0 || executor.guild.me.roles.highest.comparePositionTo(target.roles.highest) == 0) {
              await interaction.reply({
                content: `The bot's role isn't higher than the target\'s!`
              })
              console.log(`\x1b[1;33m==> WARNING: \x1b[1;37m${executor.user.tag} tried to ban ${bannedMember} but failed: \n\x1b[0m\x1b[35m -> \x1b[37mThe bot\'s role is not higher than the target\'s.`)
              return;
            };
            if (executor.roles.highest.comparePositionTo(target.roles.highest) < 0 || executor.roles.highest.comparePositionTo(target.roles.highest) == 0) {
              await interaction.reply({
                content: `Your highest role is not higher than the target\'s!`
              })
              console.log(`\x1b[1;33m==> WARNING: \x1b[1;37m${executor.user.tag} tried to ban ${bannedMember} but failed: \n\x1b[0m\x1b[35m -> \x1b[37mExecutor\'s role was not higher than the target\'s.`)
              return;
            }
          }

        if (!interaction.memberPermissions.has([Permissions.FLAGS.BAN_MEMBERS])) {
            await interaction.reply({
              content: `You do not have the permission to ban members!`
            })
            console.log(`\x1b[1;33m==> WARNING: \x1b[1;37m${executor.user.tag} tried to ban ${bannedMember} but failed: \n\x1b[0m\x1b[35m -> \x1b[37mExecutor did not have the Ban Members permission.`)
            return;
        }

        if (!executor.guild.me.permissions.has([Permissions.FLAGS.BAN_MEMBERS])) {
            await interaction.reply({
              content: `The bot does not have permission to ban members!`
            })
            console.log(`\x1b[1;33m==> WARNING: \x1b[1;37m${executor.user.tag} tried to ban ${bannedMember} but failed: \n\x1b[0m\x1b[35m -> \x1b[37mBot did not have the Ban Members permission.`)
            return;
        }


        executor.guild.bans.create(target, {reason});
        console.log(`\x1b[1;32m==> \x1b[1;37m${executor.user.tag} banned ${bannedMember}:\n\x1b[0m\x1b[35m -> \x1b[37mWith reason: ${reason}`)
        await interaction.reply({
            content: `Banned ${bannedMember}.`
        })

        cooldown.add(interaction.user.id);
          setTimeout(() => {
            // rm cooldown after it has passed
            cooldown.delete(interaction.user.id);
          }, cooldownTime);
        }
      } catch (error) {
        await interaction.reply({
          content: `An error occurred: ${error}`,
          ephemeral: true
        })
        console.error(`\x1b[1;31m==> ERROR: \x1b[1;37m${error}`);
      }
    },
}
