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
 * You should have received a copy of the GNU General Public License along with Foobar. 
 * If not, see <https://www.gnu.org/licenses/>.
 *
 */

module.exports = {
	guildUserInfoHandler: function(options) {
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
			};
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
			};		
		};
	},
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
			};
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
			};		
		};
	}
};