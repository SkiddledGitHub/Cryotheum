module.exports = {
	embedCreator: function (type, options) {
		switch (type) {
			case 'error': return {
				color: "#F04A47",
  				title: "An error occurred!",
  				description: `<:failed:962658626969940048> Something has went wrong while executing this command!\n\n**Error message**:\n>>> ${options.error}`,
			};
			case 'avatar': return {
					color: '#42B983',
      				title: `${options.title}`,
      				image: {
      					url: `${options.image}`,
      				}
				};
			case 'ctdt': return {
					color: `${options.color}`,
					title: `${options.title}`,
					description: `${options.description}`,
					thumbnail: { url: `${options.thumbnail}` },
				};
			case 'ctd': return {
					color: `${options.color}`,
					title: `${options.title}`,
					description: `${options.description}`,
				};
			case 'cd': return {
					color: `${options.color}`,
					description: `${options.description}`,
				};
		};
	}
};