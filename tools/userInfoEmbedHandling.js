/**
 * Copyright 2022 SkiddledGitHub (Discord: Skiddled#0802)
 * This program is distributed under the terms of the GNU General Public License.
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