// modules
const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, GuildMember, Role, GuildMemberRoleManager, Guild, GuildBanManager } = require('discord.js')
const { embedCreator } = require('../tools/embeds.js');

// set cooldown
const cooldown = new Set();
const cooldownTime = 6000;
const cooldownEmbed = embedCreator("cooldown", { cooldown: '6 seconds' });

module.exports = {
  data: new SlashCommandBuilder()
  .setName('ban')
  .setDescription('Ban a person from the Discord server.')
  .addUserOption((option) => option.setName('target').setDescription('Target user to ban').setRequired(true))
  .addStringOption((option) => option.setName('reason').setDescription('Reason why you banned this user').setRequired(false)),
  async execute(interaction) {
      try {

      // call cooldown if user in cooldown list
      if (cooldown.has(interaction.user.id)) {
      await interaction.reply({ 
          embeds: [cooldownEmbed]
        });

      } else {

        // variables
        var target;
        var targetTag;
        var targetID;
        var reason;

        // constants
        const executor = interaction.member;
        const executorTag = executor.user.tag;
        const executorID = executor.user.id;
        const executorGuild = executor.guild;
        const botUser = executorGuild.me;

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
            targetTag = target.tag;
            targetID = target.id;

        // user in server
        } else if (interaction.options.getMember('target') != null) {

            // set target
            target = interaction.options.getMember('target');   
            targetTag = target.user.tag;
            targetID = target.user.id;

            // check target id

            // if equal bot, pull error
            if (targetID == "413250765629423636") {

              // set embed
              const embed = embedCreator('banFailed', { who: `${targetTag}`, reason: 'You cannot ban the bot itself.' });

              // reply & log fail & return
              await interaction.reply({
                embeds: [embed]
              })
              console.log(` \x1b[1;33m=> WARNING: \x1b[1;37m${executorTag} tried to ban the bot.`);
              return;
            };

            // if equal executor, pull error
            if (targetID == executorID) {

              // set embed
              const embed = embedCreator('banFailed', { who: `${targetTag}`, reason: 'You cannot ban yourself!' });

              // reply & log fail & return
              await interaction.reply({
                embeds: [embed]
              })
              console.log(` \x1b[1;33m=> WARNING: \x1b[1;37m${executorTag} tried to ban themselves.`);
              return;
            };

            // if bot's highest role is lower than the target's, pull error
            if (botUser.roles.highest.comparePositionTo(target.roles.highest) < 0 || botUser.roles.highest.comparePositionTo(target.roles.highest) == 0) {
              
              // set embed
              const embed = embedCreator('banFailed', { who: `${targetTag}`, reason: 'The bot\'s highest role is lower than target\'s highest role.' });

              // reply & log fail & return
              await interaction.reply({
                embeds: [embed]
              })
              console.log(` \x1b[1;33m=> WARNING: \x1b[1;37m${executorTag} tried to ban ${bannedMember} but failed: \n\x1b[0m\x1b[35m  -> \x1b[37mThe bot\'s role is not higher than the target\'s.`);
              return;
            };

            // if executor's highest role is lower than the target's, pull error
            if (executor.roles.highest.comparePositionTo(target.roles.highest) < 0 || executor.roles.highest.comparePositionTo(target.roles.highest) == 0) {
              
              // set embed
              const embed = embedCreator('banFailed', { who: `${targetTag}`, reason: 'Your highest role is lower than target\'s highest role.' });

              // reply & log fail & return
              await interaction.reply({
                embeds: [embed]
              })
              console.log(` \x1b[1;33m=> WARNING: \x1b[1;37m${executorTag} tried to ban ${bannedMember} but failed: \n\x1b[0m\x1b[35m  -> \x1b[37mExecutor\'s role was not higher than the target\'s.`);
              return;
            };
          };

        // if executor does not have ban permissions, pull error
        if (!interaction.memberPermissions.has([Permissions.FLAGS.BAN_MEMBERS])) {

          // set embed
          const embed = embedCreator('banFailed', { who: `${targetTag}`, reason: 'You do not have the permission to ban members.' });

          // reply & log fail & return
          await interaction.reply({
            embeds: [embed]
          })
          console.log(` \x1b[1;33m=> WARNING: \x1b[1;37m${executorTag} tried to ban ${bannedMember} but failed: \n\x1b[0m\x1b[35m  -> \x1b[37mExecutor did not have the Ban Members permission.`);
          return;
        };

        // if bot does not have ban permissions, pull error
        if (!botUser.permissions.has([Permissions.FLAGS.BAN_MEMBERS])) {

          // set embed
          const embed = embedCreator('banFailed', { who: `${targetTag}`, reason: 'The bot does not have the permission to ban members.' });

          // reply & log fail & return
          await interaction.reply({
            embeds: [embed]
          })
          console.log(` \x1b[1;33m=> WARNING: \x1b[1;37m${executorTag} tried to ban ${bannedMember} but failed: \n\x1b[0m\x1b[35m  -> \x1b[37mBot did not have the Ban Members permission.`)
          return;
        };

        // attempt to ban member
        try {
          executor.guild.bans.create(target, {reason});

          // on success
          const successEmbed = embedCreator('banSuccess', { who: `${targetTag}`, reason: `${reason}` });
          await interaction.reply({
            embeds: [successEmbed]
          });
          console.log(`\x1b[1;32m=> \x1b[1;37m${executorTag} banned ${targetTag}:\n\x1b[0m\x1b[35m  -> \x1b[37mWith reason: ${reason}`);

        } catch (error) {

          // reply
          const errorEmbed = embedCreator('error', { error: `${error}` });
          await interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
          });
          console.error(` \x1b[1;31m=> ERROR: \x1b[1;37m${error}`); 

        };

          cooldown.add(executorID);
          setTimeout(() => {
            // rm cooldown after it has passed
            cooldown.delete(executorID);
          }, cooldownTime);
        }
      } catch (error) {
        const errorEmbed = embedCreator("error", { error: `${error}` });
        await interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
        })
        console.error(` \x1b[1;31m=> ERROR: \x1b[1;37m${error}`);
      }
    },
}
