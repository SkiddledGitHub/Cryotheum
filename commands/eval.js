const { SlashCommandBuilder, codeBlock } = require('@discordjs/builders');
const { embedCreator } = require('../tools/embeds.js');
const { debug, botOwner } = require('../config.json');
const { log } = require('../tools/loggingUtil.js');

module.exports = {
  data: new SlashCommandBuilder()
  	.setName('eval')
  	.setDescription('Evaluate JS code. Restricted to bot owner (for obvious reasons)')
  	.addStringOption((option) => option.setName('code').setDescription('Code to evaluate').setRequired(true)),
  async execute(interaction) {

      // constants
      const executor = interaction.member;
      const executorTag = executor.user.tag;
      const code = interaction.options.getString('code');
      const codeHighlighted = codeBlock('js', code);

        // if user is not bot owner, pull error
      	if (executor.user.id != botOwner) {

          // set embed & reply & log fail
          const embed = embedCreator('evalFailed', { reason: 'You are not the bot owner!', code: `${codeHighlighted}` });
          await interaction.reply({
            embeds: [embed]
          });
          if (debug) {
          log('genLog', `${executorTag} tried to execute eval but failed: \n\x1b[0m\x1b[35m  -> \x1b[37mUser is not bot owner.`);
          };
          return;

        } else {

          // try catch for eval errors
          try { 

            // set embed
            const embed = embedCreator('evalSuccess', { code: `${codeHighlighted}` });

            // execute
            let evaled = eval(code); 

            // reply
            await interaction.reply({ embeds: [embed] }); 

          } catch (error) { 

            // set embed
            const embed = embedCreator('evalFailed', { reason: `${error}`, code: `${codeHighlighted}` }); 

            // reply
            await interaction.reply({ embeds: [embed], ephemeral: true }); 

            // log fail & return
            if (debug) { 
            log('cmdErr', { errtitle: `Failed evaluating code`, content: `\x1b[1;37m${error} \n\x1b[0m\x1b[35m  -> Code: \x1b[37m${code}` })
            };
            return;

          };

          // log success
          if (debug) {
          log('genLog', `Evaluated code. \n\x1b[0m\x1b[35m  -> Code: \x1b[37m${code}`)
          };
        }
  	},
}