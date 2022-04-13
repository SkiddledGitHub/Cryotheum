const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, GuildMember, Role, GuildMemberRoleManager, Guild, GuildBanManager, Collection } = require('discord.js')

const cooldown = new Set();
const cooldownTime = 6000;

module.exports = {
  data: new SlashCommandBuilder()
  .setName('unban')
  .setDescription('Unban a person from the Discord server.')
  .addUserOption((option) => option.setName('target').setDescription('Target user to unban').setRequired(true))
  .addStringOption((option) => option.setName('reason').setDescription('Reason why you unbanned this user').setRequired(false)),
  async execute(interaction) {
      try {
      if (cooldown.has(interaction.user.id)) {
      await interaction.reply({ 
          content: `You are under cooldown! (Default cooldown is 6s)`, 
          ephemeral: true 
        });
      } else {
        var target;
        var targetID;
        var unbannedMember;
        var reason;
        var bannedUser;
        const executor = interaction.member;
        if (interaction.options.getString('reason') == null) {
          reason = `Executor: ${executor.user.tag}`
        } else {
          reason = interaction.options.getString('reason');
        }
        if (interaction.options.getMember('target') == null) {
            target = interaction.options.getUser('target');
            targetID = target.id;
            unbannedMember = target.tag;
          await executor.guild.bans.fetch({ cache: false }).then((value) => {
            bannedUser = value.get(targetID);
          });
           if (bannedUser == null) {
              await interaction.reply({
                content: `This member is not banned!`
              });
              console.log(`\x1b[1;33m==> WARNING: \x1b[1;37m${executor.user.tag} tried to unban ${unbannedMember} but failed: \n\x1b[0m\x1b[35m -> \x1b[37mTarget is not banned`)
              return;
           }
        } else if (interaction.options.getMember('target') != null) {
            target = interaction.options.getUser('target');
            unbannedMember = target.tag;
            await interaction.reply({
              content: `This member is not banned!`
            });
            console.log(`\x1b[1;33m==> WARNING: \x1b[1;37m${executor.user.tag} tried to unban ${unbannedMember} but failed: \n\x1b[0m\x1b[35m -> \x1b[37mTarget is not banned`)
            return;
          }

        if (!interaction.memberPermissions.has([Permissions.FLAGS.BAN_MEMBERS])) {
            await interaction.reply({
              content: `You do not have the permission to unban members!`
            })
            console.log(`\x1b[1;33m==> WARNING: \x1b[1;37m${executor.user.tag} tried to unban ${unbannedMember} but failed: \n\x1b[0m\x1b[35m -> \x1b[37mExecutor did not have the Ban Members permission.`)
            return;
        }

        if (!executor.guild.me.permissions.has([Permissions.FLAGS.BAN_MEMBERS])) {
            await interaction.reply({
              content: `The bot does not have permission to unban members!`
            })
            console.log(`\x1b[1;33m==> WARNING: \x1b[1;37m${executor.user.tag} tried to unban ${unbannedMember} but failed: \n\x1b[0m\x1b[35m -> \x1b[37mBot did not have the Ban Members permission.`)
            return;
        }

        try {
          executor.guild.bans.remove(target, reason);
          console.log(`\x1b[1;32m==> \x1b[1;37m${executor.user.tag} unbanned ${unbannedMember}:\n\x1b[0m\x1b[35m -> \x1b[37mWith reason: ${reason}`)
          await interaction.reply({
            content: `Unbanned ${unbannedMember}.`
          })
        }  catch (error) {
        await interaction.reply({
          content: `An error occurred: ${error}`,
          ephemeral: true
        })
        console.error(`\x1b[1;31m==> ERROR: \x1b[1;37m${error}`);
      }

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
