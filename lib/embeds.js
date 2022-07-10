/**
 * @license
 * @copyright Copyright 2022 SkiddledGitHub
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

// custom modules
const miscellaneous = require('./miscellaneous.js');

var self = module.exports = {
	/**
	 * Constructs an embed object.
	 * @function
	 * @param {string} type - The type of the embed
	 * @param {Object} options - Options for the embed.
	 * @example
	 * // creates a cooldown embed
	 * embedConstructor('cooldown', { cooldown: 'X seconds' });
	 * @returns {Object} An embed object
	 */
	embedConstructor: function (type, options) {
		switch (type) {

			/**
			 * error States
			 */

			case 'error': return {
				author: {
					name: `An error occurred!`,
					icon_url: `https://skiddledgithub.github.io/resources/bot/states/error.png`,
				},
				color:`#F04A47`,
  				description: `Something has went wrong while executing this command!`,
  				fields: [{ name: 'Error message', value: `>>> ${options.error}`, inline: false }],
			};

			case 'errorNoDebug': return {
				author: {
					name: `An error occurred!`,
					icon_url: `https://skiddledgithub.github.io/resources/bot/states/error.png`,
				},
				color:`#F04A47`,
  				description: `Something has went wrong while executing this command!`,
			};

			/**
			 * cooldown State
			 */

			case 'cooldown': return {
				author: {
					name: 'You are under cooldown!',
					icon_url: 'https://skiddledgithub.github.io/resources/bot/states/cooldown.png',
				},
				color: '#FEE65C', 
				description: `Default cooldown time for this command is **${options.cooldown}**.`,
			};

			/**
			 * not for user State
			 */

			case 'notForUser': return {
				color: '#F04A47', 
				description: `<:failed:962658626969940048> This interaction is not for you!`,
			};

			/**
			 * avatar Command
			 */

			case 'avatar': return {
      			author: {
      				name: `${options.who}\'s avatar`,
      				icon_url: `https://skiddledgithub.github.io/resources/bot/commands/avatar.png`,
      			},
				color: '#42B983',
      			image: {
      				url: `${options.image}`,
      			},
			};

			/**
			 * ban Command
			 */

			case 'banConfirmation': return {
				author: { 
					name: `Confirmation`, 
					icon_url: 'https://skiddledgithub.github.io/resources/bot/commands/ban.png',
				}, 
				color: '#F04A47', 
				description: `Are you sure that you want to ban ${options.who}?`,
			};

			case 'banCancel': return {
				author: { 
					name: `Ban for ${options.who} was cancelled.`, 
					icon_url: 'https://skiddledgithub.github.io/resources/bot/states/cancelSaved.png',
				}, 
				color: '#42B983', 
				description: `Discord user ${options.who} has not been banned.`,
			};

			case 'banFailed': return {
				author: { 
					name: `Could not ban ${options.who}`, 
					icon_url: 'https://skiddledgithub.github.io/resources/bot/states/error.png',
				}, 
				color: '#F04A47', 
				description: `Discord user ${options.who} has not been banned.`,
				fields: [{ name: 'Reason', value: `>>> ${options.reason}`, inline: false }],
			};

			case 'banSuccess': return {
				author: { 
					name: `Banned ${options.who}`, 
					icon_url: 'https://skiddledgithub.github.io/resources/bot/states/confirmDeath.png',
				}, 
				color: '#F04A47', 
				description: `Discord user ${options.who} has been banned.`,
				fields: [{ name: 'Reason', value: `>>> ${options.reason}`, inline: false }],
			};

			/**
			 * unban Command
			 */

			case 'unbanFailed': return {
				author: { 
					name: `Could not unban ${options.who}`, 
					icon_url: 'https://skiddledgithub.github.io/resources/bot/states/error.png' 
				}, 
				color: '#F04A47', 
				description: `Discord user ${options.who} has not been unbanned.`,
				fields: [{ name: 'Reason', value: `>>> ${options.reason}`, inline: false }],
			};

			case 'unbanSuccess': return {
				author: { 
					name: `Unbanned ${options.who}`, 
					icon_url: 'https://skiddledgithub.github.io/resources/bot/commands/unban.png',
				}, 
				color: '#42B983', 
				description: `Discord user ${options.who} has been unbanned.`,
				fields: [{ name: 'Reason', value: `>>> ${options.reason}`, inline: false }],
			};

			/**
			 * kick Command
			 */

			case 'kickConfirmation': return {
				author: { 
					name: `Confirmation`, 
					icon_url: 'https://skiddledgithub.github.io/resources/bot/commands/kick.png',
				}, 
				color: '#F04A47', 
				description: `Are you sure that you want to kick ${options.who}?`,
			};

			case 'kickCancel': return {
				author: { 
					name: `Kick for ${options.who} was cancelled.`, 
					icon_url: 'https://skiddledgithub.github.io/resources/bot/states/cancelSaved.png',
				}, 
				color: '#42B983', 
				description: `Discord user ${options.who} has not been kicked.`,
			};


			case 'kickFailed': return {
				author: { 
					name: `Could not kick ${options.who}`, 
					icon_url: 'https://skiddledgithub.github.io/resources/bot/states/error.png',
				}, 
				color: '#F04A47', 
				description: `Discord user ${options.who} has not been kicked.`,
				fields: [{ name: 'Reason', value: `>>> ${options.reason}`, inline: false }],
			};

			case 'kickSuccess': return {
				author: { 
					name: `Kicked ${options.who}`, 
					icon_url: 'https://skiddledgithub.github.io/resources/bot/states/confirmDeath.png',
				}, 
				color: '#F04A47', 
				description: `Discord user ${options.who} has been banned.`,
				fields: [{ name: 'Reason', value: `>>> ${options.reason}`, inline: false }],
			};


			/**
			 * eval Command
			 */

			case 'evalFailed': return {
				author: {
					name: 'Failed evaluating code',
					icon_url: 'https://skiddledgithub.github.io/resources/bot/commands/evalFailed.png',
				},
				color: '#F04A47',
				description: `Bot failed to evaluate given code.`,
				fields: [
							{ name: 'Reason', value: `>>> ${options.reason}`, inline: false }, 
							{ name: 'Code', value: `>>> ${options.code}`, inline: false },
						],
			};

			case 'evalSuccess': return {
				author: {
					name: 'Successfully evaluated code',
					icon_url: 'https://skiddledgithub.github.io/resources/bot/commands/eval.png',
				},
				color: '#42B983',
				description: `Bot has successfully evaluated given code.`,
				fields: [{ name: 'Code', value: `>>> ${options.code}`, inline: false }],
			};

			/**
			 * play Command
			 */

			case 'playSelection': return {
				author: {
					name: 'Search results',
					icon_url: 'https://skiddledgithub.github.io/resources/bot/commands/play.png',
				},
				color: '#42B983',
				description: 'Here is a list of 5 videos that was found with your search query.',
				fields: self.playResultsParser(options.results)
			}

			case 'playFailed': return {
				author: {
					name: 'Failed playing audio',
					icon_url: 'https://skiddledgithub.github.io/resources/bot/states/error.png',
				},
				color: '#F04A47',
				description: `Bot failed to play audio from given video.`,
				fields: [
							{ name: 'Reason', value: `>>> ${options.reason}`, inline: false }, 
							{ name: 'Query given', value: `>>> ${options.query}`, inline: false },
						],
			};

			case 'playSelected': return {
				color: '#42B983',
				description: `Selected **${options.title}** by **${options.name}**`,
			};

			case 'playSuccess': return {
				author: {
					name: 'Joined VC & playing audio',
					icon_url: 'https://skiddledgithub.github.io/resources/bot/commands/play.png',
				},
				color: '#42B983',
				description: `Bot is now playing **${options.title}** by ${options.name}`,
			};

			case 'playTimeout': return {
				color: '#42B983',
				description: `Bot has left the VC because the queue is empty.`,
				footer: { text: 'If this happened instantly after queuing, that means the video is forbidden in the area that the bot was hosted at' }
			}

			/**
			 * stop Command
			 */

			case 'stopFailed': return {
				author: {
					name: 'Failed to leave VC',
					icon_url: 'https://skiddledgithub.github.io/resources/bot/states/error.png',
				},
				color: '#F04A47',
				description: `Bot failed to leave VC.`,
				fields: [{ name: 'Reason', value: `>>> ${options.reason}`, inline: false }],
			};

			case 'stopSuccess': return {
				author: {
					name: 'Left VC',
					icon_url: 'https://skiddledgithub.github.io/resources/bot/commands/stop.png',
				},
				color: '#F04A47',
				description: `Bot has successfully left VC.`,
			};

			/**
			 * userinfo Command
			 */

			case 'userinfoFailed': return {
				author: {
					name: 'Failed to get user profile',
					icon_url: 'https://skiddledgithub.github.io/resources/bot/states/error.png',
				},
				color: '#F04A47',
				description: `Could not get user profile for specified user.`,
				fields: [
							{ name: 'Reason', value: `>>> ${options.reason}`, inline: false },
							{ name: 'Specified user', value: `>>> ${options.whoTag}`, inline: false },
						],
			};

			case 'userinfoSuccess':
				if (options.guildMember == 'true') {
					return (self.guildUserInfoHandler({ who: `${options.who}`, whoTag: `${options.whoTag}`, idBlock: `${options.idBlock}`, roles: `${options.roles}`, joinedAt: { full: `${options.joinedAt.full}`, mini: `${options.joinedAt.mini}` }, createdAt: { full: `${options.createdAt.full}`, mini: `${options.createdAt.mini}` }, iBadges: `${options.iBadges}`, sBadges: `${options.sBadges}`, avatar: `${options.avatar}` }));
				} else {
					return (self.userInfoHandler({ who: `${options.who}`, whoTag: `${options.whoTag}`, idBlock: `${options.idBlock}`, createdAt: { full: `${options.createdAt.full}`, mini: `${options.createdAt.mini}` }, iBadges: `${options.iBadges}`, sBadges: `${options.sBadges}`, avatar: `${options.avatar}` }));	
				}

			/**
			 * encode Command
			 */

			case 'encodeSuccess': return {
				author: {
					name: 'Successfully encoded specified string',
					icon_url: 'https://skiddledgithub.github.io/resources/bot/commands/encode.png',
				},
				color: '#42B983',
				description: 'Results:',
				fields: options.results,
			};

			case 'encodeSuccessSingle': return {
				author: {
					name: 'Successfully encoded specified string',
					icon_url: 'https://skiddledgithub.github.io/resources/bot/commands/encode.png',
				},
				color: '#42B983',
				description: `${options.results}`,
			};

			case 'encodeFailed': return {
				author: {
					name: 'Failed to encode string',
					icon_url: 'https://skiddledgithub.github.io/resources/bot/states/error.png',
				},
				color: '#F04A47',
				description: 'Could not encode specified string',
				fields: [{ name: 'Reason', value: `>>> ${options.reason}`, inline: false }],
			};

			/**
			 * decode Command
			 */

			case 'decodeSuccess': return {
				author: {
					name: 'Successfully decoded specified string',
					icon_url: 'https://skiddledgithub.github.io/resources/bot/commands/encode.png',
				},
				color: '#42B983',
				description: `${options.results}`,
			};

			case 'decodeFailed': return {
				author: {
					name: 'Failed to decode string',
					icon_url: 'https://skiddledgithub.github.io/resources/bot/states/error.png',
				},
				color: '#F04A47',
				description: 'Could not decode specified string',
				fields: [{ name: 'Reason', value: `>>> ${options.reason}`, inline: false }],
			};


			/**
			 * github Command
			 */

			case 'githubRepoSuccess': return {
				author: {
					name: options.repo.name,
					url: options.repo.url,
					icon_url: 'https://skiddledgithub.github.io/resources/bot/commands/encode.png',
				},
				color: '#42B983',
				thumbnail: { url: options.repo.ownerAvatar },
				description: options.repo.desc,
				fields: options.repo.data,
			}

			case 'githubUserSuccess': return self.githubUserParser(options.user);

			case 'githubFailed': return {
				author: {
					name: 'Failed to lookup GitHub data',
					icon_url: 'https://skiddledgithub.github.io/resources/bot/states/error.png',
				},
				color: '#F04A47',
				description: `Could not lookup GitHub ${options.type} data.`,
				fields: [{ name: 'Reason', value: `>>> ${options.reason}`, inline: false }],
			}

			/**
			 * about Command
			 */

			case 'about': return {
				author: {
					name: 'About Cryotheum',
					icon_url: 'https://skiddledgithub.github.io/resources/bot/commands/about.png'
				},
				color: '#3365E3',
				description: 'Cryotheum is an open-source bot created with love <:heart:965220811487191040> by <@285329659023851520> solely because the developer was bored and wanted to learn JavaScript.\n\nThe bot is certainly not perfect, so please drop us some suggestions and/or report bugs at our <:github:985088394470236160> [GitHub issue tracker](https://github.com/SkiddledGitHub/Cryotheum/issues).\n\nCryotheum is licensed under [GNU General Public License Version 3 (or later)](https://www.gnu.org/licenses/gpl.html)',
				fields: [
					{ name: 'Basic Information', value: `>>> Online since: <t:${options.uptime}:f>\nBot owner (As set in config): <@${options.botOwnerID}>\nDebug status: *\`${options.debugStatus}\`*` },
					{ name: 'External Links', value: `>>> <:github:985088394470236160> [GitHub repository](https://github.com/SkiddledGitHub/Cryotheum)\n<:bugReporter:965220811302637588> [Issue tracker](https://github.com/SkiddledGitHub/Cryotheum/issues)\n<:botDev:965220811436855326> [Developer's solo.to](https://solo.to/skiddled)` },
					{ name: 'Command List', value: '```/help```', inline: true },
					{ name: 'Command Information', value: '```/help command:<command name>```', inline: true }
				],
				footer: { text: `Revision ${miscellaneous.gitRevision(true)}` },
			};

			/**
			 * help Command
			 */

			case 'helpList': return {
				author: {
					name: 'Help',
					icon_url: 'https://skiddledgithub.github.io/resources/bot/commands/about.png'
				},
				color: '#3365E3',
				description: 'Here is a list of commands that this bot has.\nExecute /help command:[commandName] to know more about a specific command.',
				fields: self.helpListParser(options.list, options.categories)
			};

			case 'helpGetFailed': return {
				author: {
					name: 'Failed to lookup documentation data for specified command name',
					icon_url: 'https://skiddledgithub.github.io/resources/bot/states/error.png'
				},
				color: '#F04A47',
				description: 'Could not find documentation data for specified command name.',
				fields: [{ name: 'Reason', value: `>>> ${options.reason}`, inline: false }]
			};

			case 'helpGetSuccess': return {
				author: {
					name: 'Help',
					icon_url: 'https://skiddledgithub.github.io/resources/bot/commands/about.png'
				},
				color: '#3365E3',
				description: `***\`${options.documentation.name}\`*** ***\`${options.type}\`***`,
				fields: self.helpGetParser(options.documentation)
			}

			/**
			 * Color + Description
			 * @deprecated
			 */
			case 'colDesc': return {
					color: `${options.color}`,
					description: `${options.description}`,
				};

			/**
			 * Color + Title + Description
			 * @deprecated
			 */
			case 'colTitleDesc': return {
					color: `${options.color}`,
					title: `${options.title}`,
					description: `${options.description}`,
				};

			/**
			 * Color + Title + Description + Thumbnail
			 * @deprecated
			 */
			case 'colTitleDescThumb': return {
					color: `${options.color}`,
					title: `${options.title}`,
					description: `${options.description}`,
					thumbnail: { url: `${options.thumbnail}` },
				};

			/**
			 * Color + Description + Author
			 * @deprecated
			 */
			case 'colDescAuthor': return {
					color: `${options.color}`,
					description: `${options.description}`,	
					author: {
						name: `${options.author.title}`,
						icon_url: `${options.author.icon}`,
					},
				};

			/**
			 * stdout Command
			 * @deprecated
			 */

			case 'stdoutFailed': return {
				author: {
					name: 'Failed to send message to stdout',
					icon_url: 'https://skiddledgithub.github.io/resources/bot/states/error.png',
				},
				color: '#F04A47',
				description: `Could not send the message to stdout.`,
				fields: [
							{ name: 'Reason', value: `>>> ${options.reason}`, inline: false }, 
							{ name: 'Message', value: `>>> ${options.message}`, inline: false },
						],
			};

			case 'stdoutSuccess': return {
				author: {
					name: 'Sent message to stdout',
					icon_url: 'https://skiddledgithub.github.io/resources/bot/commands/stdout.png',
				},
				color: '#42B983',
				description: `Sent message to stdout.`,
				fields: [{ name: 'Message', value: `>>> ${options.message}`, inline: false }],
			};
		}
	},
	/**
	 * Helper for the userinfo command embed constructor - guild member
	 * @function
	 * @param {Object} options - Options for the helper
	 * @param {string} [options.sBadges] - Contains special badges data
	 * @param {string} [options.iBadges] - Contains insight badges data
	 * @param {string} options.whoTag - Tag string for specified Discord user
	 * @param {string} options.who - Mention for specified Discord user
	 * @param {string} options.idBlock - Code block that contains specified Discord user's User ID
	 * @param {string} options.avatar - URL for specified Discord user's avatar
	 * @param {string} options.roles - Roles data for the user
	 * @param {Object} options.joinedAt - Contains formatted time block that correlates to the user's guild join date
	 * @param {string} options.joinedAt.full - Time block with the 'Full' format
	 * @param {string} options.joinedAt.mini - Time block with the 'Mini' format
	 * @param {Object} options.createdAt - Contains formatted time block that correlates to the user's account creation date
	 * @param {string} options.createdAt.full - Time block with the 'Full' format
	 * @param {string} options.createdAt.mini - Time block with the 'Mini' format
	 * @example
	 * // creates an embed object for the userinfo command
	 * guildUserInfoHandler({ 
	 * 		sBadges: '',
	 * 		iBadges: '',
	 * 		whoTag: 'test#0000',
	 * 		who: [User Object],
	 * 		idBlock: [codeBlock],
	 * 		avatar: '[Avatar Image URL]',
	 * 		roles: '@everyone',
	 *		joinedAt: { full: [time], mini: [time] },
	 *		createdAt: { full: [time], mini: [time] } 
	 *	});
	 * @returns {Object} Embed object
	 */
	guildUserInfoHandler: function(options) {
		if (!options.sBadges) {
			if (!options.iBadges) {
				return { 
					author: { 
						name: `User Profile`, 
						icon_url: 'https://skiddledgithub.github.io/resources/bot/commands/userinfo.png', 
					}, 
					title: `${options.whoTag}`, 
					color: '#42B983', 
					description: `Mention: ${options.who}\n${options.idBlock}`, 
					thumbnail: { 
						url: `${options.avatar}`,
					}, 
					fields: [
								{ name: 'Server Roles', value: `${options.roles}`, inline: false },
								{ name: 'Server Join Date', value: `${options.joinedAt.full} \n(${options.joinedAt.mini})`, inline: true },
								{ name: 'Account Creation Date', value: `${options.createdAt.full} \n(${options.createdAt.mini})`, inline: true },
							],
				};
			} else {
				return { 
					author: { 
						name: `User Profile`, 
						icon_url: 'https://skiddledgithub.github.io/resources/bot/commands/userinfo.png', 
					}, 
					title: `${options.whoTag}`, 
					color: '#42B983', 
					description: `Mention: ${options.who}\n${options.idBlock}`, 
					thumbnail: { 
						url: `${options.avatar}`,
					}, 
					fields: [
								{ name: 'Insights', value: `${options.iBadges}`, inline: false },
								{ name: 'Server Roles', value: `${options.roles}`, inline: false },
								{ name: 'Server Join Date', value: `${options.joinedAt.full} \n(${options.joinedAt.mini})`, inline: true },
								{ name: 'Account Creation Date', value: `${options.createdAt.full} \n(${options.createdAt.mini})`, inline: true },
							],
				};
			}
		} else {
			if (!options.iBadges) {
				return { 
					author: { 
						name: `User Profile`, 
						icon_url: 'https://skiddledgithub.github.io/resources/bot/commands/userinfo.png', 
					}, 
					title: `${options.whoTag}`, 
					color: '#42B983', 
					description: `Mention: ${options.who}\n${options.idBlock}`, 
					thumbnail: { 
						url: `${options.avatar}`,
					}, 
					fields: [
								{ name: 'Special Badges', value: `${options.sBadges}`, inline: false },
								{ name: 'Server Roles', value: `${options.roles}`, inline: false },
								{ name: 'Server Join Date', value: `${options.joinedAt.full} \n(${options.joinedAt.mini})`, inline: true },
								{ name: 'Account Creation Date', value: `${options.createdAt.full} \n(${options.createdAt.mini})`, inline: true },
							],
				};
			} else {
				return { 
					author: { 
						name: `User Profile`, 
						icon_url: 'https://skiddledgithub.github.io/resources/bot/commands/userinfo.png', 
					}, 
					title: `${options.whoTag}`, 
					color: '#42B983', 
					description: `Mention: ${options.who}\n${options.idBlock}`, 
					thumbnail: { 
						url: `${options.avatar}`,
					}, 
					fields: [
								{ name: 'Special Badges', value: `${options.sBadges}`, inline: true },
								{ name: 'Insights', value: `${options.iBadges}`, inline: true },
								{ name: 'Server Roles', value: `${options.roles}`, inline: false },
								{ name: 'Server Join Date', value: `${options.joinedAt.full} \n(${options.joinedAt.mini})`, inline: true },
								{ name: 'Account Creation Date', value: `${options.createdAt.full} \n(${options.createdAt.mini})`, inline: true },
							],
				};
			}		
		}
	},
	/**
	 * Helper for the userinfo command embed constructor - user
	 * @function
	 * @param {Object} options - Options for the helper
	 * @param {string} [options.sBadges] - Contains special badges data
	 * @param {string} [options.iBadges] - Contains insight badges data
	 * @param {string} options.whoTag - Tag string for specified Discord user
	 * @param {string} options.who - Mention for specified Discord user
	 * @param {string} options.idBlock - Code block that contains specified Discord user's User ID
	 * @param {string} options.avatar - URL for specified Discord user's avatar
	 * @param {Object} options.createdAt - Contains formatted time block that correlates to the user's account creation date
	 * @param {string} options.createdAt.full - Time block with the 'Full' format
	 * @param {string} options.createdAt.mini - Time block with the 'Mini' format
	 * @example
	 * // creates an embed object for the userinfo command
	 * guildUserInfoHandler({ 
	 * 		sBadges: '',
	 * 		iBadges: '',
	 * 		whoTag: 'test#0000',
	 * 		who: [User Object],
	 * 		idBlock: [codeBlock],
	 * 		avatar: [Avatar Image URL],
	 *		createdAt: { full: [time], mini: [time] } 
	 *	});
	 * @returns {Object} Embed object
	 */
	userInfoHandler: function(options) {
		if (options.sBadges == '') {
			if (options.iBadges == '') {
				return { 
					author: { 
						name: `User Profile`, 
						icon_url: 'https://skiddledgithub.github.io/resources/bot/commands/userinfo.png', 
					}, 
					title: `${options.whoTag}`, 
					color: '#42B983', 
					description: `Mention: ${options.who}\n${options.idBlock}`, 
					thumbnail: { 
					url: `${options.avatar}`,
					}, 
					fields: [
								{ name: 'Account Creation Date', value: `${options.createdAt.full} \n(${options.createdAt.mini})`, inline: true },
							],
				};
			} else {
				return { 
					author: { 
						name: `User Profile`, 
						icon_url: 'https://skiddledgithub.github.io/resources/bot/commands/userinfo.png', 
					}, 
					title: `${options.whoTag}`, 
					color: '#42B983', 
					description: `Mention: ${options.who}\n${options.idBlock}`, 
					thumbnail: { 
						url: `${options.avatar}`,
					}, 
					fields: [
								{ name: 'Insights', value: `${options.iBadges}`, inline: false },
								{ name: 'Account Creation Date', value: `${options.createdAt.full} \n(${options.createdAt.mini})`, inline: true },
							],
				};
			}
		} else {
			if (options.iBadges == '') {
				return { 
					author: { 
						name: `User Profile`, 
						icon_url: 'https://skiddledgithub.github.io/resources/bot/commands/userinfo.png', 
					}, 
					title: `${options.whoTag}`, 
					color: '#42B983', 
					description: `Mention: ${options.who}\n${options.idBlock}`, 
					thumbnail: { 
						url: `${options.avatar}`,
					}, 
					fields: [
								{ name: 'Special Badges', value: `${options.sBadges}`, inline: false },
								{ name: 'Account Creation Date', value: `${options.createdAt.full} \n(${options.createdAt.mini})`, inline: true },
							],
				};
			} else {
				return { 
					author: { 
						name: `User Profile`, 
						icon_url: 'https://skiddledgithub.github.io/resources/bot/commands/userinfo.png', 
					}, 
					title: `${options.whoTag}`, 
					color: '#42B983', 
					description: `Mention: ${options.who}\n${options.idBlock}`, 
					thumbnail: { 
						url: `${options.avatar}`,
					}, 
					fields: [
								{ name: 'Special Badges', value: `${options.sBadges}`, inline: true },
								{ name: 'Insights', value: `${options.iBadges}`, inline: true },
								{ name: 'Account Creation Date', value: `${options.createdAt.full} \n(${options.createdAt.mini})`, inline: true },
							],
					};
			}		
		}
	},
	/**
	 * Helper for the github command - user
	 * @function
	 * @param {Object} user - Contains sufficient data for a GitHub user
	 * @param {boolean} user.org - If true, the user is identified as a GitHub Organization user
	 * @param {string} user.name - GitHub username
	 * @param {string} user.url - URL that leads to the GitHub user's GitHub profile
	 * @param {string} user.avatarURL - GitHub avatar URL
	 * @param {string} user.bio - GitHub bio
	 * @param {Array} user.data - Other user data
	 * @example
	 * // output an embed object that contains GitHub user data
	 * githubUserParser({ 
	 * 		org: false,
	 * 		name: 'test',
	 * 		url: 'https://github.com',
	 * 		avatarURL: '[Avatar URL]',
	 * 		bio: 'this is a test',
	 * 		data: [
	 * 			{ name: 'test', value: 'test value', inline: true }
	 * 		]
	 * });
	 */
	githubUserParser: function(user) {
		if (user.org) {
			return {
				author: {
					name: user.name,
					url: user.url,
					icon_url: 'https://skiddledgithub.github.io/resources/bot/commands/encode.png',
				},
				color: '#42B983',
				thumbnail: { url: user.avatarURL },
				description: `***\`Organization\`***\n>>> ${user.bio}`,
				fields: user.data,
			}
		} else {
			return {
				author: {
					name: user.name,
					url: user.url,
					icon_url: 'https://skiddledgithub.github.io/resources/bot/commands/encode.png',
				},
				color: '#42B983',
				thumbnail: { url: user.avatarURL },
				description: `***\`User\`***\n>>> ${user.bio}`,
				fields: user.data,
			}
		}
	},
	/**
	 * Helper for the help command - list commands
	 * @function
	 * @param {Object[]} list - A list of all commands with their destinated category
	 * @param {string} list[].name - Name of the command
	 * @param {string} list[].category - Destinated category
	 * @param {Object[]} categories - A list of categories
	 * @example
	 * // creates a field array that lists all commands in their destinated category
	 * helpListParser(
	 * 		[
	 * 			{ name: 'test', category: 'Development' },
	 * 			{ name: 'hello', category: 'there' }
	 * 		],
	 * 		['Development', 'there']
	 * );
	 * @returns {Array} Field array for embed
	 */
	helpListParser: function(list, categories) {
		let fields = [];
		categories.sort();
		categories.forEach((value) => {
			fields.push({ name: value, value: '' });
		});
		fields.forEach((fieldItem) => {
			list.forEach((item) => {
				if (fieldItem.name === item.category) {
					fieldItem.value += `\`${item.name}\` `
				}
			});
		});
		return fields;
	},
	/**
	 * Helper for the help command - get documentation
	 * @function
	 * @param {Object} documentation - Object that contains data of documentation
	 * @param {string} documentation.category - Category of the document
	 * @param {string} [documentation.description] - Specify description
	 * @param {string} [documentation.syntax] - Specify syntax
	 * @param {string} [documentation.cooldown] - Specify cooldown time
	 * @param {Object[]} [documentation.arguments] - Specify arguments
	 * @param {string} documentation.arguments[].name - Specify argument name
	 * @param {string} documentation.arguments[].targetValue - Target value of the argument
	 * @param {string} documentation.arguments[].description - Describe argument
	 * @param {string} [documentation.arguments[].selection] - Specify selections of the argument
	 * @example
	 * // creates a field array that shows documentation data 
	 * helpGetParser({ 
	 * 		name: 'test',
	 * 		category: 'Development',
	 * 		description: 'testing purposes',
	 * 		syntax: '/test a:[String]',
	 * 		cooldown: '99 seconds',
	 * 		arguments: [
	 * 			{ name: 'a', targetValue: 'String', description: 'test argument' }
	 * 		]
	 * })
	 * @returns {Array} Field array for embed
	 */
	helpGetParser: function(documentation) {
		let fields = [];
		fields.push({ name: '<:category:994798995677380628> Category', value: `${documentation.category}`, inline: true });
		if (documentation.description) {
			fields.push({ name: '<:description:994798984562495550> Description', value: documentation.description, inline: true });
		} else {
			fields.push({ name: '<:description:994798984562495550> Description', value: '*No description provided*', inline: true });
		}
		if (documentation.syntax) {
			fields.push({ name: '<:syntax:994798978623344680> Syntax', value: documentation.syntax });
		} else {
			fields.push({ name: '<:syntax:994798978623344680> Syntax', value: '*No syntax provided*' });
		}
		if (documentation.cooldown) {
			fields.push({ name: '<:cooldown:994798990723923998> Cooldown', value: documentation.cooldown });
		} else {
			fields.push({ name: '<:cooldown:994798990723923998> Cooldown', value: '*No cooldown*' });
		}
		if (documentation.arguments.length != 0) {
			let args = '';
			documentation.arguments.forEach((item, index) => {
				if (index !== documentation.arguments.length - 1) {
					if (item.selection) {
						args += `> \`${item.name}\` ***\`${item.targetValue}\`***: ${item.description}\n> -> **Selection**: [ ${item.selection} ]\n`;
					} else {
						args += `> \`${item.name}\` ***\`${item.targetValue}\`***: ${item.description}\n`
					}
				} else {
					if (item.selection) {
						args += `> \`${item.name}\` ***\`${item.targetValue}\`***: ${item.description}\n> -> **Selection**: [ ${item.selection} ]`;
					} else {
						args += `> \`${item.name}\` ***\`${item.targetValue}\`***: ${item.description}`
					}
				}				
			});
			fields.push({ name: '<:arguments:994799000530190366> Arguments', value: args });
		} else {
			fields.push({ name: '<:arguments:994799000530190366> Arguments', value: '*No arguments*' });
		}
		return fields;
	},
	playResultsParser: function(results) {
		let fields = [];

		results.forEach((item, index) => {
			if (item.type === 'video') {
				fields.push({ name: `${index + 1}. **${item.metadata.title}** by **${item.author.name}**`, value: `Length: ${miscellaneous.formatTime(miscellaneous.getFullTime(item.metadata.length))}` })
			}
		});

		return fields;
	}
};