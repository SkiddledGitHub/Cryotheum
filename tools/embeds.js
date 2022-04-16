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
					icon_url: `https://skiddledgithub.github.io/resources/bot/error.png`,
				},
				color:`#F04A47`,
  				description: `Something has went wrong while executing this command!`,
  				fields: [{ name: 'Error message', value: `>>> ${options.error}`, inline: false }],
			};

			// cooldown
			case 'cooldown': return {
				author: {
					name: 'You are under cooldown!',
					icon_url: 'https://skiddledgithub.github.io/resources/bot/cooldown.png',
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
      				icon_url: `https://skiddledgithub.github.io/resources/bot/avatar.png`,
      			},
				color: '#42B983',
      			image: {
      				url: `${options.image}`,
      			},
			};

			/*
			// ban cases
			*/

			// failed
			case 'banFailed': return {
				author: { 
					name: `Could not ban ${options.who}`, 
					icon_url: 'https://skiddledgithub.github.io/resources/bot/error.png',
				}, 
				color: '#F04A47', 
				description: `Discord user ${options.who} has not been banned.`,
				fields: [{ name: 'Reason', value: `>>> ${options.reason}`, inline: false }],
			};

			// success
			case 'banSuccess': return {
				author: { 
					name: `Banned ${options.who}`, 
					icon_url: 'https://skiddledgithub.github.io/resources/bot/ban.png',
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
					icon_url: 'https://skiddledgithub.github.io/resources/bot/error.png' 
				}, 
				color: '#F04A47', 
				description: `Discord user ${options.who} has not been unbanned.`,
				fields: [{ name: 'Reason', value: `>>> ${options.reason}`, inline: false }],
			};

			// success
			case 'unbanSuccess': return {
				author: { 
					name: `Unbanned ${options.who}`, 
					icon_url: 'https://skiddledgithub.github.io/resources/bot/unban.png',
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
					icon_url: 'https://skiddledgithub.github.io/resources/bot/error.png',
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
					icon_url: 'https://skiddledgithub.github.io/resources/bot/eval.png',
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
					icon_url: 'https://skiddledgithub.github.io/resources/bot/error.png',
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
					icon_url: 'https://skiddledgithub.github.io/resources/bot/play.png',
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
					icon_url: 'https://skiddledgithub.github.io/resources/bot/error.png',
				},
				color: '#F04A47',
				description: `Bot failed to leave VC.`,
				fields: [{ name: 'Reason', value: `>>> ${options.reason}`, inline: false }],
			};

			// success
			case 'stopSuccess': return {
				author: {
					name: 'Left VC',
					icon_url: 'https://skiddledgithub.github.io/resources/bot/stop.png',
				},
				color: '#F04A47',
				description: `Bot has successfully left VC.`,
			};

			/*
			// stdout cases
			*/

			// failed
			case 'stdoutFailed': return {
				author: {
					name: 'Failed to send message to stdout',
					icon_url: 'https://skiddledgithub.github.io/resources/bot/error.png',
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
					icon_url: 'https://skiddledgithub.github.io/resources/bot/stdout.png',
				},
				color: '#42B983',
				description: `Sent message to stdout.`,
				fields: [{ name: 'Message', value: `>>> ${options.message}`, inline: false }],
			};

			/*
			// userinfo cases
			*/

			// failed
			case 'userinfoFailed': return {
				author: {
					name: 'Failed to get user profile',
					icon_url: 'https://skiddledgithub.github.io/resources/bot/error.png',
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
				return { 
					author: { 
						name: `User Profile`, 
						icon_url: 'https://skiddledgithub.github.io/resources/bot/userinfo.png', 
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
						icon_url: 'https://skiddledgithub.github.io/resources/bot/userinfo.png', 
					}, 
					title: `${options.whoTag}`, 
					color: '#42B983', 
					description: `Mention: ${options.who}\n${options.idBlock}`, 
					thumbnail: { 
						url: `${options.avatar}`,
					}, 
					fields: [{ name: 'Account Creation Date', value: `${options.createdAt.full} \n(${options.createdAt.mini})`, inline: true }],
				};
			};

			// experiment
			case 'experiment': return {
				author: {
					name: 'Experiment',
					icon_url: 'https://skiddledgithub.github.io/resources/bot/experiment.png',
				},
				color: '#42B983',
				description: `${options.desc}`,
			};

			/*==================*/
			//		legacy		//
			/*==================*/

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
		};
	}
};