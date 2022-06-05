module.exports = {
	log: function(type, message) {
		switch (type) {
			case 'genErr': console.error(` \x1b[1;31m=> Error: ${message}\x1b[0m`); break;
			case 'cmdErr': console.error(` \x1b[1;31m=> ${message.errtitle}: ${message.content}\x1b[0m`); break;
			case 'genWarn': console.warn(` \x1b[1;33m=> Warning: ${message}\x1b[0m`); break;
			case 'genLog': console.log(` \x1b[1;32m=> ${message}\x1b[0m`); break;
		}
	}
}