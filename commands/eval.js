// discord.js modules
const { SlashCommandBuilder, codeBlock } = require('discord.js');

// 3rd party modules
const { embedConstructor } = require('../lib/embeds.js');
const { log } = require('../lib/logging.js');

// data
const { debug, botOwner } = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
  	.setName('eval')
  	.setDescription('Evaluate JS code. Restricted to bot owner (for obvious reasons)')
  	.addStringOption((option) => option.setName('code').setDescription('Code to evaluate').setRequired(true))
    .addBooleanOption((option) => option.setName('async').setDescription('Make the code run in an async function').setRequired(false)),
  async execute(interaction) {

      const executor = { obj: interaction.member, tag: interaction.user.tag, id: interaction.user.id }
      const code = interaction.options.getString('code')
      const codeHighlighted = codeBlock('js', code)

      var embed

      if (debug) log('genLog', { event: 'Commands > Eval', content: `Initialize`, extra: [`${executor.tag}`] })

        // NOTE: Eval is evil!
        //       Do not modify the check below.
        //       It can cause serious security risks to your bot!

      	if (executor.id != botOwner) {

          let embed = embedConstructor('evalFailed', { reason: 'You are not the bot owner!', code: `${codeHighlighted}` })
          if (interaction.isRepliable()) {
            interaction.reply({ embeds: [embed] })
          } else {
            try {
              interaction.followUp({ embeds: [embed] })
            } catch (e) {
              interaction.channel.send({ embeds: [embed] })
            }
          }
          if (debug) log('genWarn', { event: 'Commands > Eval', content: `Failed.`, extra: [`${executor.tag}`], cause: 'Executor is not bot owner.' })
          log('genLog', { event: 'Commands > Eval', content: `Done${debug ? '' : ' with suppressed warnings'}.` })
          return

        } else {

          await interaction.deferReply()

          if (code.length > 1020) {
            embed = embedConstructor('evalSuccess', { code: `Too long to display\n(${code.length} characters)` })
          } else {
            embed = embedConstructor('evalSuccess', { code: `${codeHighlighted}` })
          }

          // NOTE: Eval is evil! Do not replicate what I am doing here.
          //       DO NOT MODIFY THE OWNER CHECK.
          //       It can cause serious security risks to your bot!
          //
          //       With Eval, you can execute NodeJS code directly without modifying
          //       the bot itself.
          //
          //       Accessible items:
          //          - interaction (as "i") (Please do not use Interaction#reply or any
          //            other variant of it in the eval code.)
          //          - All current variables defined in this command file
          //          - All NodeJS functions
          //
          //       Bad practices in eval code:
          //          - Infinite loops
          //          - Any operation that takes longer than 15 minutes to finish execution
          //
          //       If your operations take longer than 15 minutes to finish executing, your bot **might** crash!

          // NOTE: Yes, I know safer alternatives for Eval exists on npm to install
          //       But what I want is to debug the bot using the Eval command.
          //       Other alternatives either removes NodeJS functionality or removes access
          //       to the interaction object.

          let errObj
          if (debug) log('genLog', { event: 'Commands > Eval', content: 'Executing', extra: [`${code}`, `${executor.tag}`] })
          if (interaction.options.getBoolean('async')) {
            try { await eval(`try { let i = interaction; async function evaluation() { ${code} }; evaluation(); } catch (e) { errObj = e; }`); } catch (e) { errObj = e }
          } else {
            try { await eval(`try { let i = interaction; ${code} } catch (e) { errObj = e; }`); } catch (e) { errObj = e; }
          }

          if (errObj) {
            if (debug) log('cmdErr', { event: 'Commands > Eval', content: `Evaluation failed.`, extra: [`${executor.tag}`] })
            if (code.length > 1020) {
              embed = embedConstructor('evalFailed', { reason: errObj.message, code: `Too long to display\n(${code.length} characters)` })
            } else {
              embed = embedConstructor('evalFailed', { reason: errObj.message, code: `${codeHighlighted}` })
            };

            try {
              interaction.editReply({ embeds: [embed] })
            } catch (e) {
              if (!interaction.isRepliable()) {
                try {
                  interaction.followUp({ embeds: [embed] })
                } catch (e) {
                  interaction.channel.send({ embeds: [embed] })
                }
              }
            }

            if (debug) log('runtimeErr', { event: 'Commands > Eval', errName: errObj.name, content: errObj.message, extra: [`${code}`,`${executor.tag}`] })
            return

          } else {

            try {
              interaction.editReply({ embeds: [embed] })
            } catch (e) {
              if (!interaction.isRepliable()) {
                try {
                  interaction.followUp({ embeds: [embed] })
                } catch (e) {
                  interaction.channel.send({ embeds: [embed] })
                }
              }
            }

            log('genLog', { event: 'Commands > Eval', content: `Evaluated code.`, extra: [`${code}`,`${executor.tag}`] });

          }
          
        }
  	},
  documentation: {
    name: 'eval',
    category: 'Utility',
    description: 'Evaluate JS code. Restricted to bot owner (for obvious reasons)',
    syntax: '/eval code:[String] async:[Boolean]',
    arguments: [
      { name: 'code', targetValue: 'String', description: 'Code to evaluate' },
      { name: 'async', targetValue: 'Boolean [Optional Selection]', description: 'Make the code run in an async function.', selection: '*`True`* | *`False`*' }
    ]
  }
}