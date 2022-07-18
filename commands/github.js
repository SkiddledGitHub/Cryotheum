/**
 *
 * Copyright 2022 SkiddledGitHub
 *
 * This file is part of Cryotheum.
 * Cryotheum is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * Cryotheum is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; 
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with Foobar. 
 * If not, see <https://www.gnu.org/licenses/>.
 *
 */

// discord.js modules
const { SlashCommandBuilder, time, AttachmentBuilder } = require('discord.js');

// 3rd party modules
const axios = require('axios');

// custom modules
const { embedConstructor } = require('../lib/embeds.js');
const { log } = require('../lib/logging.js');
const github = require('../lib/github.js');

// data
const { debug, githubAuth } = require('../config.json');

// set cooldown
const cooldown = new Set();
const cooldownTime = 1000;
const cooldownEmbed = embedConstructor("cooldown", { cooldown: '1 seconds' });

module.exports = {
  data: new SlashCommandBuilder()
  .setName('github')
  .setDescription('Get information on a GitHub Repository or user.')
  .addStringOption((option) => option.setName('type').setDescription('Select what you want to search').setRequired(true)
    .addChoices(
      { name: 'GitHub Repository', value: 'repo' },
      { name: 'GitHub User', value: 'user' }
    ))
  .addStringOption((option) => option.setName('target').setDescription('Search query').setRequired(true)),
  async execute(interaction) {
    // cooldown management
    if (cooldown.has(interaction.user.id)) {
    await interaction.reply({ embeds: [cooldownEmbed] });
      } else {

        const executor = { obj: interaction.member, tag: interaction.user.tag }

        if (debug) log('genLog', { event: 'Commands > GitHub', content: `Initialize`, extra: [`${executor.tag}`] })

        if (interaction.options.getString('type') == 'repo') {

          let response

          let status = await (async () => {
            await interaction.deferReply()
            if (debug) log('genLog', { event: 'Commands > GitHub', content: 'Executor selected repo search.', extra: [`${executor.tag}`] })
            if (debug) log('genLog', { event: 'Commands > GitHub', content: 'Attempting repo search', extra: [`${interaction.options.getString('target')}`, `${executor.tag}`] })

            response = await github.repoSearch(interaction.options.getString('target'))

            if (!response) {
              if (debug) log('genLog', { event: 'Commands > GitHub', content: 'Repo search failed. Moving to query search', extra: [`${interaction.options.getString('target')}`, `${executor.tag}`] })
              response = await github.queryRepoSearch(interaction.options.getString('target'))
            }

            if (!response) {
              if (debug) log('cmdErr', { event: 'Commands > GitHub', content: 'Failed', cause: 'No search results was found with provided query', extra: [`${interaction.options.getString('target')}`, `${executor.tag}`] })
              let embed = embedConstructor('githubFailed', { type: 'repository', reason: 'No search results was found with your keywords!' })
              await interaction.editReply({ embeds: [embed] })
              log('genLog', { event: 'Commands > GitHub', content: `Done${debug ? '' : ' with suppressed errors'}.`, extra: [`${interaction.options.getString('target')}`, `${executor.tag}`] })
            }

            return response ? true : false

          })()

          if (!status) return

          if (debug) log('genLog', { event: 'Commands > GitHub', content: 'Parsing data', extra: [`${interaction.options.getString('target')}`, `${executor.tag}`] })

          let repo = {
            name: response.full_name,
            ownerAvatar: response.owner.avatar_url,
            url: response.html_url
          }

          repo.data = [{ name: 'Stars', value: `${response.stargazers_count}`, inline: true }]

          if (response.subscribers_count) {
            repo.data.push({ name: 'Watchers', value: `${response.subscribers_count}`, inline: true })
          }

          repo.data.push({ name: 'Forks', value: `${response.forks}`, inline: true })

          let contributionsData = await github.contributions(repo.name)
          let contributions = 0
          if (contributionsData) {
            contributionsData.forEach((item) => {
              contributions = contributions + item.contributions
            });
            repo.data.push({ name: 'Commits', value: `${contributions}`, inline: true })
          } else {
            repo.data.push({ name: 'Commits', value: '(Unavailable)', inline: true })
          }

          if (response.description) {
            repo.desc = `*${response.description}*`
          } else {
            repo.desc = '*No description provided*'
          }

          repo.data.push({ name: 'Open Issues', value: `${response.open_issues_count}`, inline: true })

          if (response.language) {
            repo.data.push({ name: 'Language', value: response.language, inline: true })
          }

          if (response.license) {
            repo.data.push({ name: 'License', value: response.license.name, inline: true })
          }
          
          let creationRawTime = new Date(response.created_at).getTime()
          let creationTime = { full: time(Math.round(creationRawTime / 1000), 'f'), mini: time(Math.round(creationRawTime / 1000), 'R') }
          repo.data.push({ name: 'Creation Date', value: `${creationTime.full} \n(${creationTime.mini})`, inline: true })
          
          if (response.parent) {
            repo.data.push({ name: 'Parent', value: `[${response.parent.full_name}](${response.parent.html_url})` })
          }

          let repoTopics = ''
          if (response.topics.length != 0) {
            response.topics.forEach((item) => {
              repoTopics += `\`${item}\` `
            })
            repo.data.push({ name: 'Topics', value: repoTopics })
          }

          if (debug) { log('genLog', { event: 'Commands > GitHub', content: `Data parsed.`, extra: [`${interaction.options.getString('target')}`, `${executor.tag}`] }); console.log(repo); }

          let embed = embedConstructor('githubRepoSuccess', { repo: repo })
          if (debug) log('genLog', { event: 'Commands > GitHub', content: 'Getting README.md from repository', extra: [`${interaction.options.getString('target')}`, `${executor.tag}`] });

          await (async () => {
            let attachment
            await axios
              .get(`https://api.github.com/repos/${response.full_name}/readme`, { headers: { Accept: 'application/vnd.github.v3+json' } })
              .then(att => {
                let buffer = Buffer.from(Buffer.from(att.data.content, 'base64').toString(), 'utf-8')
                if (debug) log('genLog', { event: 'Commands > GitHub', content: 'README.md seems to exist on the repository, making it an attachment', extra: [`${interaction.options.getString('target')}`, `${executor.tag}`] })
                attachment = new AttachmentBuilder(buffer, { name: 'README.md' })
              })
              .catch(error => {
                if (error.response) {
                  if (error.response.status == 404) {
                    if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'README.md seems to not exist on the repository, skipping', extra: [`${interaction.options.getString('target')}`, `${executor.tag}`] }) }
                  };
                };
              });

            if (attachment) { interaction.editReply({ embeds: [embed], files: [attachment] }); } else { interaction.editReply({ embeds: [embed] }); }
            if (debug) log('genLog', { event: 'Commands > GitHub', content: 'Done.', extra: [`${interaction.options.getString('target')}`, `${executor.tag}`] })

          })()
      	}

        if (interaction.options.getString('type') == 'user') {
          
          let response

          let status = await (async () => {
            await interaction.deferReply();
            if (debug) log('genLog', { event: 'Commands > GitHub', content: 'Executor selected user search.', extra: [`${executor.tag}`] })
            if (debug) log('genLog', { event: 'Commands > GitHub', content: 'Attempting user search', extra: [`${interaction.options.getString('target')}`, `${executor.tag}`] })

            response = await github.userSearch(interaction.options.getString('target'))

            if (!response) {
              if (debug) log('cmdErr', { event: 'Commands > GitHub', content: 'User search failed. Moving to query search', extra: [`${interaction.options.getString('target')}`, `${executor.tag}`] })
              response = await github.queryUserSearch(interaction.options.getString('target'))
            }

            if (!response) {
              if (debug) log('cmdErr', { event: 'Commands > GitHub', content: 'Failed.', cause: 'No search results was found with provided query', extra: [`${interaction.options.getString('target')}`, `${executor.tag}`] })
              let embed = embedConstructor('githubFailed', { type: 'user', reason: 'No search result was found with your keywords!' })
              await interaction.editReply({ embeds: [embed] })
              if (debug) log('genLog', { event: 'Commands > GitHub', content: `Done${debug ? '' : ' with suppressed errors'}.`, extra: [`${interaction.options.getString('target')}`, `${executor.tag}`] })
            }

            return response ? true : false
          })()

          if (!status) return

          if (debug) log('genLog', { event: 'Commands > GitHub', content: 'Parsing data', extra: [`${interaction.options.getString('target')}`, `${executor.tag}`] })

          let user = {
            name: response.login,
            avatarURL: response.avatar_url,
            url: response.html_url
          }

          user.data = [
            { name: 'Repositories', value: `${response.public_repos}`, inline: true },
            { name: 'Gists', value: `${response.public_gists}`, inline: true },
            { name: 'Followers', value: `${response.followers}`, inline: true },
            { name: 'Following', value: `${response.following}`, inline: true }
          ]

          if (response.type == 'User') {
            let commitsCount = await github.userContributions(response.login)
            if (!commitsCount) {
              user.data.push({ name: 'Commits', value: '(Unavailable)', inline: true })
            } else {
              user.data.push({ name: 'Commits', value: `${commitsCount}`, inline: true })
            }
            user.org = false
          } else if (response.type == 'Organization') {
            user.org = true
          }

          if (response.bio) {
            user.bio = `*${response.bio}*`
          } else {
            user.bio = '*No bio provided*'
          }

          if (response.company) {
            user.data.push({ name: 'Company', value: response.company, inline: true })
          }

          if (response.blog) {
            user.data.push({ name: 'Blog', value: response.blog, inline: true })
          }

          if (response.location) {
            user.data.push({ name: 'Location', value: response.location, inline: true })
          }

          if (response.twitter_username) {
            user.data.push({ name: 'Twitter Username', value: response.twitter_username, inline: true })
          }

          let creationRawTime = new Date(response.created_at).getTime()

          let creationTime =  { full: time(Math.round(creationRawTime / 1000), 'f'), mini: time(Math.round(creationRawTime / 1000), 'R') }

          user.data.push({ name: 'Creation Date', value: `${creationTime.full} \n(${creationTime.mini})`, inline: true })

          if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'Data parsed', extra: [`${interaction.options.getString('target')}`, `${executor.tag}`] }); console.log(user); }

          let embed = embedConstructor('githubUserSuccess', { user: user })

          if (debug) log('genLog', { event: 'Commands > GitHub', content: 'Attempting to get README.md from user\'s special repository' })

          await (async () => {
            let attachment
            await axios
              .get(`https://api.github.com/repos/${response.login}/${response.login}/readme`, { headers: { Accept: 'application/vnd.github.v3+json' } })
              .then(att => {
                let buffer = Buffer.from(Buffer.from(att.data.content, 'base64').toString(), 'utf-8')
                if (debug) log('genLog', { event: 'Commands > GitHub', content: 'User seems to have a special README.md file, making it an attachment', extra: [`${interaction.options.getString('target')}`, `${executor.tag}`] })
                attachment = new AttachmentBuilder(buffer, { name: 'README.md' })
              })
              .catch(error => {
                if (error.response) {
                  if (error.response.status == 404) {
                    if (debug) log('genLog', { event: 'Commands > GitHub', content: 'User seems to not have a special README.md file, skipping', extra: [`${interaction.options.getString('target')}`, `${executor.tag}`] })
                  }
                }
              })

              if (attachment) { interaction.editReply({ embeds: [embed], files: [attachment] }); } else { interaction.editReply({ embeds: [embed] }); }
              if (debug) log('genLog', { event: 'Commands > GitHub', content: 'Done.', extra: [`${interaction.options.getString('target')}`, `${executor.tag}`] })

          })()

        }

        // cooldown management
      	cooldown.add(interaction.user.id)
        setTimeout(() => { cooldown.delete(interaction.user.id); }, cooldownTime)

      }
  },
  documentation: {
    name: 'github',
    category: 'Information',
    description: 'Get information on a GitHub Repository or user.',
    syntax: '/github type:[StringSelection] target:[String]',
    cooldown: `${Math.round(cooldownTime / 1000)} seconds`,
    arguments: [
      { name: 'type', targetValue: 'String [Selection]', description: 'Select what you want to search.', selection: '*`repo`* | *`user`*' },
      { name: 'target', targetValue: 'String', description: 'Search query.'  }
    ]
  }
}
