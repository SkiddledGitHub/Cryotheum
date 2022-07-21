const { SlashCommandBuilder } = require('discord.js');

const { embedConstructor } = require('../lib/embeds.js');
const { log } = require('../lib/logging.js');

const { debug } = require('../config.json');

const cooldown = new Set();
const cooldownTime = 2000;
const cooldownEmbed = embedConstructor("cooldown", { cooldown: '2 seconds' });

module.exports = {
  data: new SlashCommandBuilder()
  .setName('help')
  .setDescription('Basic bot documentation command.')
  .addStringOption((option) => option.setName('command').setDescription('Command to show documentation for').setRequired(false)),
  async execute(interaction) {
    if (cooldown.has(interaction.user.id)) {
    await interaction.reply({ embeds: [cooldownEmbed] });
      } else {

        const executor = { obj: interaction.member, tag: interaction.user.tag }

        if (debug) log('genLog', { event: 'Commands > Help', content: `Initialize`, extra: [`${executor.tag}`] })

        await interaction.deferReply()

        if (!interaction.options.getString('command')) {
          if (debug) log('genLog', { event: 'Commands > Help', content: `Displaying command list`, cause: 'Executor provided no query', extra: [`${executor.tag}`] })
          let commandList = []
          let commandCategories = []

          if (debug) log('genLog', { event: 'Commands > Help', content: `Fetching command list data`, extra: [`${executor.tag}`] })

          interaction.client.commands.forEach((value) => {
            if (value.documentation.name) {
              if (value.documentation.category) {
                commandList.push({ name: value.documentation.name, category: value.documentation.category })
              } else {
                commandList.push({ name: value.documentation.name, category: 'Uncategorized' })
              }
            }
          })

          if (debug) { log('genLog', { event: 'Commands > Help', content: `Parsed command list data`, extra: [`${executor.tag}`] }); console.log(commandList); }
          if (debug) log('genLog', { event: 'Commands > Help', content: `Parsing command categories`, extra: [`${executor.tag}`] })

          interaction.client.commands.forEach((value) => {
            if (value.documentation.category) {
              if (!commandCategories.includes(value.documentation.category)) {
                commandCategories.push(value.documentation.category)
              }
            }
          })

          if (debug) { log('genLog', { event: 'Commands > Help', content: `Parsed command categories`, extra: [`${executor.tag}`] }); console.log(commandCategories); }

          let embed = embedConstructor('helpList', { list: commandList, categories: commandCategories })

          await interaction.editReply({ embeds: [embed] })
          log('genLog', { event: 'Commands > Help', content: 'Done.', extra: [`${executor.tag}`] })
        } else if (interaction.options.getString('command')) {
          let inputCommandName = interaction.options.getString('command').toLowerCase()

          if (debug) log('genLog', { event: 'Commands > Help', content: `Looking up command documentation`, extra: [`${inputCommandName}`,`${executor.tag}`] })

          let commandObject = interaction.client.commands.find(d => d.documentation.name.toLowerCase() === inputCommandName)
          let docsObject = undefined
          if (commandObject) {
            docsObject = commandObject.documentation
          }

          if (!docsObject) {
            if (debug) log('cmdErr', { event: 'Commands > Help', content: `Failed.`, cause: 'No documentation data found for query. Assuming invalid command name', extra: [`${inputCommandName}`,`${executor.tag}`] })
            let embed = embedConstructor('helpGetFailed', { reason: 'Inputted command name is invalid!' })
            await interaction.editReply({ embeds: [embed] })
            log('genLog', { event: 'Commands > Help', content: `Done${debug ? '' : ' with suppressed errors'}.`, extra: [`${inputCommandName}`,`${executor.tag}`] })
          } else if (docsObject) {
            if (debug) log('genLog', { event: 'Commands > Help', content: `Documentation data found`, extra: [`${inputCommandName}`,`${executor.tag}`] })
            let embed = embedConstructor('helpGetSuccess', { documentation: docsObject, type: 'Command' })
            await interaction.editReply({ embeds: [embed] })
            log('genLog', { event: 'Commands > Help', content: `Done.`, extra: [`${inputCommandName}`,`${executor.tag}`] })
          }
        }

      	cooldown.add(interaction.user.id)
        setTimeout(() => { cooldown.delete(interaction.user.id); }, cooldownTime)

      }
  },
  documentation: {
    name: 'help',
    category: 'Information',
    description: 'Basic bot documentation command.',
    syntax: '/help command:[StringOptional]',
    cooldown: `${Math.round(cooldownTime / 1000)} seconds`,
    arguments: [
      { name: 'command', targetValue: 'String [Optional]', description: 'The command to display documentation for.' }
    ]
  }
}
