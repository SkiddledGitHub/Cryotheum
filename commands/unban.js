// modules
const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, GuildMember, Role, GuildMemberRoleManager, Guild, GuildBanManager, Collection } = require('discord.js')
const { embedCreator } = require('../tools/embeds.js');

// set cooldown
const cooldown = new Set();
const cooldownTime = 6000;
const cooldownEmbed = embedCreator("cooldown", { cooldown: '6 seconds' });

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
          embeds: [cooldownEmbed]
        });
      } else {

        // variables
        var target;
        var targetID;
        var targetTag;
        var reason;
        var bannedUser;

        // constants
        const executor = interaction.member;
        const executorTag = executor.user.tag;

        // get reason
        if (interaction.options.getString('reason') == null) {
          reason = `Executor: ${executorTag}`
        } else {
          reason = interaction.options.getString('reason');
        };

        // user not in server
        if (interaction.options.getMember('target') == null) {

            // set target
            target = interaction.options.getUser('target');
            targetID = target.id;
            targetTag = target.tag;

          // attempt to find target in banned members list 
          await executor.guild.bans.fetch({ cache: false }).then((value) => {
            bannedUser = value.get(targetID);
          });

          // pull an error if cannot find user
           if (bannedUser == null) {

            // reply
            const embed = embedCreator("unbanFailed", { who: `${targetTag}`, reason: `${targetTag} is not banned.` });
              await interaction.reply({
                embeds: [embed]
              });
              console.log(` \x1b[1;33m=> WARNING: \x1b[1;37m${executorTag} tried to unban ${targetTag} but failed: \n\x1b[0m\x1b[35m  -> \x1b[37mTarget is not banned`);
              return;
           };

        // pull an error if user is in guild (member is not banned)
        } else if (interaction.options.getMember('target') != null) {

            // set target
            target = interaction.options.getUser('target');
            targetTag = target.tag;

            // reply
            const embed = embedCreator("unbanFailed", { who: `${targetTag}`, reason: `${targetTag} is not banned.` });
            await interaction.reply({
              embeds: [embed]
            });
            console.log(` \x1b[1;33m=> WARNING: \x1b[1;37m${executorTag} tried to unban ${targetTag} but failed: \n\x1b[0m\x1b[35m  -> \x1b[37mTarget is not banned`);
            return;
          };

        // pull an error if executor does not have ban permissions
        if (!interaction.memberPermissions.has([Permissions.FLAGS.BAN_MEMBERS])) {

            // reply
            const embed = embedCreator("unbanFailed", { who: `${targetTag}`, reason: 'You do not have permission to unban members!' });
            await interaction.reply({
              embeds: [embed]
            });
            console.log(` \x1b[1;33m=> WARNING: \x1b[1;37m${executorTag} tried to unban ${targetTag} but failed: \n\x1b[0m\x1b[35m  -> \x1b[37mExecutor did not have the Ban Members permission.`);
            return;
        };

        // pull an error if bot does not have ban permissions
        if (!executor.guild.me.permissions.has([Permissions.FLAGS.BAN_MEMBERS])) {

            // reply
            const embed = embedCreator("unbanFailed", { who: `${targetTag}`, reason: 'The bot does not have permission to unban members!' });
            await interaction.reply({
              embeds: [embed]
            });
            console.log(` \x1b[1;33m=> WARNING: \x1b[1;37m${executorTag} tried to unban ${targetTag} but failed: \n\x1b[0m\x1b[35m  -> \x1b[37mThe bot does not have the Ban Members permission.`);
            return;
        };

        // attempt to unban member
        try { 
          executor.guild.bans.remove(target, reason); 
          
          // on success
          const successEmbed = embedCreator("unbanSuccess", { who: `${targetTag}`, reason: `${reason}` });
          await interaction.reply({
            embeds: [successEmbed]
          });
          console.log(` \x1b[1;32m=> \x1b[1;37m${executorTag} unbanned ${targetTag}:\n\x1b[0m\x1b[35m  -> \x1b[37mWith reason: ${reason}`);

        } catch (error) { 

          // reply
          var errorEmbed = embedCreator("error", { error: `${error}` }); 
          await interaction.reply({ embeds: [errorEmbed] }); 
          console.error(` \x1b[1;31m=> ERROR: \x1b[1;37m${error}`); 

        };

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
