/**
 *
 * Copyright 2022 SkiddledGitHub (Discord: Skiddled#0802)
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

const { guildUserInfoHandler, userInfoHandler } = require('./userInfoEmbedHandling.js');

module.exports = {
	embedCreator: function (type, options) {
		switch (type) {

			/*==================*/
			//		faults		//
			/*==================*/

			// on error
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

			// cooldown
			case 'cooldown': return {
				author: {
					name: 'You are under cooldown!',
					icon_url: 'https://skiddledgithub.github.io/resources/bot/states/cooldown.png',
				},
				color: '#FEE65C', 
				description: `Default cooldown time for this command is **${options.cooldown}**.`,
			};

			/*==================*/
			// command specific	//
			/*==================*/

			// avatar
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

			/*
			// ban cases
			*/

			// confirmation
			case 'banConfirmation': return {
				author: { 
					name: `Confirmation`, 
					icon_url: 'https://skiddledgithub.github.io/resources/bot/commands/ban.png',
				}, 
				color: '#F04A47', 
				description: `Are you sure that you want to ban ${options.who}?`,
			};

			// cancel
			case 'banCancel': return {
				author: { 
					name: `Ban for ${options.who} was cancelled.`, 
					icon_url: 'https://skiddledgithub.github.io/resources/bot/commands/unban.png',
				}, 
				color: '#42B983', 
				description: `Discord user ${options.who} has not been banned.`,
			};


			// failed
			case 'banFailed': return {
				author: { 
					name: `Could not ban ${options.who}`, 
					icon_url: 'https://skiddledgithub.github.io/resources/bot/states/error.png',
				}, 
				color: '#F04A47', 
				description: `Discord user ${options.who} has not been banned.`,
				fields: [{ name: 'Reason', value: `>>> ${options.reason}`, inline: false }],
			};

			// not for user
			case 'banFailedNFU': return {
				color: '#F04A47', 
				description: `<:failed:962658626969940048> This button is not for you!`,
			};

			// success
			case 'banSuccess': return {
				author: { 
					name: `Banned ${options.who}`, 
					icon_url: 'https://skiddledgithub.github.io/resources/bot/commands/ban.png',
				}, 
				color: '#F04A47', 
				description: `Discord user ${options.who} has been banned.`,
				fields: [{ name: 'Reason', value: `>>> ${options.reason}`, inline: false }],
			};

			/*
			// unban cases 
			*/

			// failed
			case 'unbanFailed': return {
				author: { 
					name: `Could not unban ${options.who}`, 
					icon_url: 'https://skiddledgithub.github.io/resources/bot/states/error.png' 
				}, 
				color: '#F04A47', 
				description: `Discord user ${options.who} has not been unbanned.`,
				fields: [{ name: 'Reason', value: `>>> ${options.reason}`, inline: false }],
			};

			// success
			case 'unbanSuccess': return {
				author: { 
					name: `Unbanned ${options.who}`, 
					icon_url: 'https://skiddledgithub.github.io/resources/bot/commands/unban.png',
				}, 
				color: '#42B983', 
				description: `Discord user ${options.who} has been unbanned.`,
				fields: [{ name: 'Reason', value: `>>> ${options.reason}`, inline: false }],
			};

			/*
			// eval cases
			*/

			// failed
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

			// success
			case 'evalSuccess': return {
				author: {
					name: 'Successfully evaluated code',
					icon_url: 'https://skiddledgithub.github.io/resources/bot/commands/eval.png',
				},
				color: '#42B983',
				description: `Bot has successfully evaluated given code.`,
				fields: [{ name: 'Code', value: `>>> ${options.code}`, inline: false }],
			};

			/*
			// play cases
			*/

			// failed
			case 'playFailed': return {
				author: {
					name: 'Failed playing video',
					icon_url: 'https://skiddledgithub.github.io/resources/bot/states/error.png',
				},
				color: '#F04A47',
				description: `Bot failed to play audio from given video.`,
				fields: [
							{ name: 'Reason', value: `>>> ${options.reason}`, inline: false }, 
							{ name: 'URL given', value: `>>> ${options.url}`, inline: false },
						],
			};

			// success
			case 'playSuccess': return {
				author: {
					name: 'Joined VC & playing audio',
					icon_url: 'https://skiddledgithub.github.io/resources/bot/commands/play.png',
				},
				color: '#42B983',
				description: `Bot has successfully joined VC and is now playing audio from given video.`,
				fields: [{ name: 'URL given', value: `>>> ${options.url}`, inline: false }],
			};

			/*
			// stop cases
			*/

			// failed
			case 'stopFailed': return {
				author: {
					name: 'Failed to leave VC',
					icon_url: 'https://skiddledgithub.github.io/resources/bot/states/error.png',
				},
				color: '#F04A47',
				description: `Bot failed to leave VC.`,
				fields: [{ name: 'Reason', value: `>>> ${options.reason}`, inline: false }],
			};

			// success
			case 'stopSuccess': return {
				author: {
					name: 'Left VC',
					icon_url: 'https://skiddledgithub.github.io/resources/bot/commands/stop.png',
				},
				color: '#F04A47',
				description: `Bot has successfully left VC.`,
			};

			/*
			// userinfo cases
			*/

			// failed
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

			// success
			case 'userinfoSuccess':
				if (options.guildMember == 'true') {
					return (guildUserInfoHandler({ who: `${options.who}`, whoTag: `${options.whoTag}`, idBlock: `${options.idBlock}`, roles: `${options.roles}`, joinedAt: { full: `${options.joinedAt.full}`, mini: `${options.joinedAt.mini}` }, createdAt: { full: `${options.createdAt.full}`, mini: `${options.createdAt.mini}` }, iBadges: `${options.iBadges}`, sBadges: `${options.sBadges}`, avatar: `${options.avatar}` }));
				} else {
					return (userInfoHandler({ who: `${options.who}`, whoTag: `${options.whoTag}`, idBlock: `${options.idBlock}`, createdAt: { full: `${options.createdAt.full}`, mini: `${options.createdAt.mini}` }, iBadges: `${options.iBadges}`, sBadges: `${options.sBadges}`, avatar: `${options.avatar}` }));	
				};

			/*
			// encode
			*/

			case 'encodeSuccess': return {
				author: {
					name: 'Successfully encoded specified string',
					icon_url: 'https://skiddledgithub.github.io/resources/bot/commands/eval.png',
				},
				color: '#42B983',
				description: 'Results:',
				fields: options.results,
			};

			case 'encodeSuccessSingle': return {
				author: {
					name: 'Successfully encoded specified string',
					icon_url: 'https://skiddledgithub.github.io/resources/bot/commands/eval.png',
				},
				color: '#42B983',
				description: `${options.results}`,
			};

			// failed
			case 'encodeFailed': return {
				author: {
					name: 'Failed to encode string',
					icon_url: 'https://skiddledgithub.github.io/resources/bot/states/error.png',
				},
				color: '#F04A47',
				description: 'Could not encode specified string',
				fields: [
					{ name: 'Reason', value: `>>> ${options.reason}`, inline: false },
				],
			};

			/*
			// about command
			*/

			case 'about': return {
				author: {
					name: 'About Cryotheum',
					icon_url: 'https://skiddledgithub.github.io/resources/bot/badges/insights/bot.png'
				},
				color: '#3365E3',
				description: 'Cryotheum is an open-source bot created with love <:heart:965220811487191040> by <@285329659023851520> solely because the developer was bored and wanted to learn JavaScript.\n\nThe bot is certainly not perfect, so please drop us some suggestions and/or report bugs at our [<:github:985088394470236160> GitHub issue tracker](https://github.com/SkiddledGitHub/Cryotheum/issues).\n\nCryotheum is licensed under [GNU General Public License Version 3 (or later)](https://www.gnu.org/licenses/gpl.html)',
				fields: [
					{ name: 'Basic Information', value: `>>> Online since: <t:${options.uptime}:f>\nBot owner (As set in config): <@${options.botOwnerID}>\nDebug status: *\`${options.debugStatus}\`*` },
					{ name: 'External Links', value: `>>> <:github:985088394470236160> GitHub repository: [Here](https://github.com/SkiddledGitHub/Cryotheum)\n<:bugReporter:965220811302637588> Issue tracker: [Here](https://github.com/SkiddledGitHub/Cryotheum/issues)\n<:botDev:965220811436855326> Developer's solo.to: [Here](https://solo.to/skiddled)` },
				],
				footer: { text: 'the bot\'s profile image is the Cryotheum Dust, an item in the Thermal Foundation mod for Minecraft' },
			};

			/*======================*/
			//  legacy / deprecated	//
			/*=======================

			// color + desc
			case 'colDesc': return {
					color: `${options.color}`,
					description: `${options.description}`,
				};

			// color + title + desc
			case 'colTitleDesc': return {
					color: `${options.color}`,
					title: `${options.title}`,
					description: `${options.description}`,
				};

			// color + title + desc + thumb
			case 'colTitleDescThumb': return {
					color: `${options.color}`,
					title: `${options.title}`,
					description: `${options.description}`,
					thumbnail: { url: `${options.thumbnail}` },
				};

			// color + desc + author
			case 'colDescAuthor': return {
					color: `${options.color}`,
					description: `${options.description}`,	
					author: {
						name: `${options.author.title}`,
						icon_url: `${options.author.icon}`,
					},
				};

			// stdout

			// failed
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

			// success
			case 'stdoutSuccess': return {
				author: {
					name: 'Sent message to stdout',
					icon_url: 'https://skiddledgithub.github.io/resources/bot/commands/stdout.png',
				},
				color: '#42B983',
				description: `Sent message to stdout.`,
				fields: [{ name: 'Message', value: `>>> ${options.message}`, inline: false }],
			};
*/
		};
	}
};