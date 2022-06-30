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

// modules
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment } = require('discord.js');
const { embedConstructor, log } = require('../lib/cryoLib.js');
const { debug } = require('../config.json');
const axios = require('axios');

// set cooldown
const cooldown = new Set();
const cooldownTime = 1000;
const cooldownEmbed = embedConstructor("cooldown", { cooldown: '1 seconds' });

module.exports = {
  data: new SlashCommandBuilder()
  .setName('github')
  .setDescription('Get information on a GitHub Repository or user.')
  .addStringOption((option) => option.setName('type').setDescription('Select what you want to search').setRequired(true)
                                     .addChoice('GitHub Repository', 'repo')
                                     .addChoice('GitHub User', 'user'))
  .addStringOption((option) => option.setName('target').setDescription('GitHub Repository or User').setRequired(true)),
  async execute(interaction) {
    // cooldown management
    if (cooldown.has(interaction.user.id)) {
    await interaction.reply({ embeds: [cooldownEmbed] });
      } else {

        const executor = interaction.member;
        const executorTag = executor.user.tag;
        var quit = 0;

        if (debug) { log('genLog', { event: 'Commands > GitHub', content: `Command initialized by ${executorTag}` }); };

        if (interaction.options.getString('type') == 'repo') {

          var repoRawData;

          async function githubRepoSearch(query) {
            if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'Attempting to search using the /repos/(owner)/(repoName) endpoint' }); };
            var resData;
             await axios
              .get(`https://api.github.com/repos/${query}`, { headers: { 'Accept': 'application:vnd.github.v3+json' } })
              .then(res => {
                if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'Axios recieved search results from GitHub API.' }); };
                resData = res.data;
              })
              .catch(error => {
              if (error.response) {
                if (error.response.status == 404) {
                  if (debug) { log('cmdErr', { event: 'GitHub', content: 'Could not search using the /repos/(owner)/(repoName) endpoint.' }); };
                  return;
                } else {
                  if (debug) { log('runtimeErr', { event: 'GitHub', errName: error.name, content: error.message }); };
                }
              } else {
                if (debug) { log('runtimeErr', { event: 'GitHub', errName: error.name, content: error.message }); };
                return;
              };
            });
            return resData;
          };

          async function githubQueryRepoSearch(query) {
            if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'Attempting to search using the /search/repositories endpoint' }); };
            var resData;
             await axios
              .get(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}`, { headers: { 'Accept': 'application:vnd.github.v3+json' } })
              .then(res => {
                if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'Axios recieved search results from GitHub API.' }); };
                if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'Using top result.' }); };
                resData = res.data.items[1];
              })
              .catch(error => {
              if (error.response) {
                if (error.response.status == 422) {
                  if (debug) { log('cmdErr', { event: 'GitHub', content: `An error occurred! ${error.message}` }); };
                  return;
                } else {
                  if (debug) { log('runtimeErr', { event: 'GitHub', errName: error.name, content: error.message }); };
                  return;
                }
              } else {
                if (debug) { log('runtimeErr', { event: 'GitHub', errName: error.name, content: error.message }); };
                return;
              };
            });
            return resData;
          };

          async function mainRepoFunction() {
            interaction.deferReply();
            if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'User selected repo search.' }); };
            if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'Using Axios to search GitHub API...' }); };

            if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'Attempting repo search' }); };

            repoRawData = await githubRepoSearch(interaction.options.getString('target'));

            if (!repoRawData) {
              if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'Repo search failed, attempting query search' }); };
              repoRawData = await githubQueryRepoSearch(interaction.options.getString('target'));
            };

            if (!repoRawData) {
              if (debug) { log('cmdErr', { event: 'GitHub', content: 'Search failed!' }); };
              if (debug) { log('cmdErr', { event: 'GitHub', content: 'Sending error message...' }); };
              let embed = embedConstructor('githubFailed', { type: 'repository', reason: 'No search results was found with your keywords!' });
              await interaction.editReply({ embeds: [embed] });
              quit = 1;
              return;
            };

          };
            
          await mainRepoFunction();

          if (quit == 1) { return; };

          if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'Parsing data...' }); };

            let repo = {
              name: repoRawData.full_name,
              ownerAvatar: repoRawData.owner.avatar_url,
              url: repoRawData.html_url
            };

            repo.data = [{ name: 'Stars', value: `${repoRawData.stargazers_count}`, inline: true }];

            if (repoRawData.subscribers_count) {
              repo.data.push({ name: 'Watchers', value: `${repoRawData.subscribers_count}`, inline: true });
            };

            repo.data.push({ name: 'Forks', value: `${repoRawData.forks}`, inline: true });

            if (repoRawData.description) {
              repo.desc = `*${repoRawData.description}*`;
            } else {
              repo.desc = '*No description provided*';
            };

            repo.data.push({ name: 'Open Issues', value: `${repoRawData.open_issues_count}`, inline: true });

            if (repoRawData.language) {
              repo.data.push({ name: 'Language', value: repoRawData.language, inline: true });
            };

            if (repoRawData.license) {
              repo.data.push({ name: 'License', value: repoRawData.license.name, inline: true });
            };

            if (repoRawData.parent) {
              repo.data.push({ name: 'Parent', value: `[${repoRawData.parent.full_name}](${repoRawData.parent.html_url})` })
            }

            var repoTopics = '';

            if (repoRawData.topics.length != 0) {
              repoRawData.topics.forEach((item, index, array) => {
                repoTopics += `\`${item}\` `;
              })
              repo.data.push({ name: 'Topics', value: repoTopics })
            };

            if (debug) { log('genLog', { event: 'Commands > GitHub', content: `Data parsed:` }); console.log(repo); };

            if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'Constructing reply embed' }); };
            let embed = embedConstructor('githubRepoSuccess', { repo: repo });

            if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'Getting README.md from repository' }); };
            var attachment;

            async function sendResponse() {
              await axios
            .get(`https://api.github.com/repos/${repoRawData.full_name}/readme`, { headers: { 'Accept': 'application/vnd.github.v3+json' } })
            .then(att => {
              let buffer = Buffer.from(Buffer.from(att.data.content, 'base64').toString(), 'utf-8');
              if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'README.md seems to exist on the repository, making it an attachment...' }); };
              attachment = new MessageAttachment(buffer, att.data.name);
            })
            .catch(error => {
              if (error.response) {
                if (error.response.status == 404) {
                  if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'README.md seems to not exist on the repository, skipping...' }) }
                };
              };
            });
              if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'Replying with success embed' }); };
              if (attachment) { interaction.editReply({ embeds: [embed], files: [attachment] }); } else { interaction.editReply({ embeds: [embed] }); };
            };
            await sendResponse();

      	};

        if (interaction.options.getString('type') == 'user') {
          
          var userRawData;

          async function githubUserSearch(query) {
            if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'Attempting to search using the /users/(username) endpoint' }); };
            var userRes;
            await axios
              .get(`https://api.github.com/users/${query}`, { headers: { 'Accept': 'application/vnd.github.v3+json' } })
              .then(res => {
                if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'Axios recieved search results from GitHub API.' }); };
                userRes = res.data;
              })
              .catch(error => {
                if (error.response) {
                  if (error.response.status == 404) {
                    if (debug) { log('cmdErr', { event: 'GitHub', content: 'Could not search using the /users/(username) endpoint.' }); };
                    return;
                  }
                } else {
                  if (debug) { log('runtimeErr', { event: 'GitHub', errName: error.name, content: error.message }); };
                  return;
                }
              });
              return userRes;
          };

          async function githubQueryUserSearch(query) {
            if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'Attempting to search using the /search/users endpoint' }); };
            var userRes;
            await axios
              .get(`https://api.github.com/search/users?q=${encodeURIComponent(query)}`, { headers: { 'Accept': 'application/vnd.github.v3+json' } })
              .then(res => {
                if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'Axios recieved search results from GitHub API.' }); };
                if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'Using top result.' }); };
                userRes = res.data.items[1];
              })
              .catch(error => {
                if (error.response) {
                  if (error.response.status == 422) {
                    if (debug) { log('cmdErr', { event: 'GitHub', content: `An error occurred! ${error.message}` }); };
                    return;
                  } else {
                    if (debug) { log('runtimeErr', { event: 'GitHub', errName: error.name, content: error.message }); };
                    return;
                  }
                } else {
                  if (debug) { log('runtimeErr', { event: 'GitHub', errName: error.name, content: error.message }); };
                  return;
                }
              });
              return userRes;
          };

          async function mainUserFunction() {
            interaction.deferReply();
            if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'User selected user search.' }); };
            if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'Using Axios to search GitHub API...' }); };

            if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'Attempting user search' }); };
            userRawData = await githubUserSearch(interaction.options.getString('target'));

            if (!userRawData) {
              if (debug) { log('cmdErr', { event: 'GitHub', content: 'User search failed, attempting query search...' }); };
              userRawData = await githubQueryUserSearch(interaction.options.getString('target'));
            };

            if (!userRawData) {
              if (debug) { log('cmdErr', { event: 'GitHub', content: 'Search failed!' }); };
              if (debug) { log('cmdErr', { event: 'GitHub', content: 'Sending error message' }); };
              let embed = embedConstructor('githubFailed', { type: 'user', reason: 'No search result was found with your keywords!' });
              await interaction.editReply({ embeds: [embed] });
              quit = 1;
              return;
            }
          }

          await mainUserFunction();

          if (quit == 1) { return; };
          if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'Parsing data...' }); };

          let user = {
            name: userRawData.name,
            avatarURL: userRawData.avatar_url,
            url: userRawData.html_url
          };

          user.data = [
            { name: 'Repositories', value: `${userRawData.public_repos}`, inline: true },
            { name: 'Gists', value: `${userRawData.public_gists}`, inline: true },
            { name: 'Followers', value: `${userRawData.followers}`, inline: true },
            { name: 'Following', value: `${userRawData.following}`, inline: true }
          ];

          if (userRawData.bio) {
            user.bio = `*${userRawData.bio}*`;
          } else {
            user.bio = '*No bio provided*';
          };

          if (userRawData.company) {
            user.data.push({ name: 'Company', value: userRawData.company, inline: true });
          };

          if (userRawData.blog) {
            user.data.push({ name: 'Blog', value: userRawData.blog, inline: true });
          };

          if (userRawData.location) {
            user.data.push({ name: 'Location', value: userRawData.location, inline: true });
          };

          if (userRawData.twitter_username) {
            user.data.push({ name: 'Twitter Username', value: userRawData.twitter_username, inline: true })
          };

          if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'Data parsed:' }); console.log(user); };

          if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'Constructing reply embed' }); };
          let embed = embedConstructor('githubUserSuccess', { user: user });

          if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'Attempting to get README.md from user\'s special repository' }); };
          var attachment;

          async function sendResponse() {
            await axios
              .get(`https://api.github.com/repos/${userRawData.login}/${userRawData.login}/readme`, { headers: { 'Accept': 'application/vnd.github.v3+json' } })
              .then(att => {
                let buffer = Buffer.from(Buffer.from(att.data.content, 'base64').toString(), 'utf-8');
                if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'User seems to have a special README.md file, making it an attachment...' }); };
                attachment = new MessageAttachment(buffer, att.data.name);
              })
              .catch(error => {
                if (error.response) {
                  if (error.response.status == 404) {
                    if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'User seems to not have a special README.md file, skipping...' }); };
                  }
                };
              });
              if (debug) { log('genLog', { event: 'Commands > GitHub', content: 'Replying with success embed' }); };
              if (attachment) { interaction.editReply({ embeds: [embed], files: [attachment] }); } else { interaction.editReply({ embeds: [embed] }); };
          }
          await sendResponse();

        };

        // cooldown management
      	cooldown.add(interaction.user.id);
        setTimeout(() => { cooldown.delete(interaction.user.id); }, cooldownTime);

      }
  }
}
