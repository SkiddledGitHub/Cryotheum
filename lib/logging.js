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
const miscFunctions = require('./miscellaneous.js')

var self = module.exports = {
	/**
	 * Creates a formatted string that is suitable for console.log || .error || .warn
	 * @function
	 * @param {string} type - Specifies the type of the log. Cannot be omitted.
	 * @param {Object} message - Specifies the message. Cannot be omitted.
	 * @param {string} [message.event='Main'] - Specifies the event that this log was made in.
	 * @param {string} message.content - Specifies the log message content. Cannot be omitted.
	 * @param {string} message.errName - Specifies the error name. Can only be used with the genError, error and runtimeErr log types.
	 * @param {string} [message.cause] - Specifies the cause of the log.
	 * @param {Array} [message.extra] - Specify extra messages.
	 * @example
	 * // creates a generic formatted string for console.log with
	 * // the tag "Test" and "test" as the log message content
	 * // should output '\x1b[1;32m[Test]\x1b[0;37m test'
	 * 
	 * createLogString('generic', { event: 'Test', content: 'test' });
	 * @returns {string} A string that can be used for console.log || .error || .warn for custom logging
	 */
	createLogString: function(type, message) {
		let logOptions = {
			type: '',
			message: {
				event: '',
				errName: '',
				content: '',
				cause: '',
				extra: [],
			}
		};
		let logString;

		if (miscFunctions.testFor(message) !== 'Object') {
			return '\x1b[1;31m[Error > Logging] \x1b[0;37mMessage parameter is not an Object!\x1b[0m';
		} else {

			logOptions.type = type;

			if (logOptions.type == 'genErr' || logOptions.type == 'error' || logOptions.type == 'runtimeErr') {
				if (!message.errName) {
					return '\x1b[1;31m[Error > Logging] \x1b[0;37mAn errName was not specified!\x1b[0m';
				} else {
					logOptions.message.errName = message.errName;
				}
			}
			if (!message.event) { logOptions.message.event = 'Main' } else { logOptions.message.event = message.event; }
			if (!message.content) { return '\x1b[1;31m[Error > Logging] \x1b[0;37mLog message has no content!\x1b[0m'; } else { logOptions.message.content = message.content }
			if (message.cause) { logOptions.message.cause = message.cause; }
			if (message.extra && miscFunctions.testFor(message.extra) !== 'Array') { 
				return '\x1b[1;31m[Error > Logging] \x1b[0;37mThe extra parameter in the message options must be an array of strings!\x1b[0m'; 
			} else if (message.extra && miscFunctions.testFor(message.extra) == 'Array') {
				logOptions.message.extra = message.extra;
			}

			if (logOptions.type == 'genLog' || logOptions.type == 'generic') {
				logString = `\x1b[1;32m[${logOptions.message.event}]\x1b[0;37m ${logOptions.message.content}`;
			} else if (logOptions.type == 'genErr' || logOptions.type == 'error') {
				logString = `\x1b[1;31m[Error > ${logOptions.message.errName}]\x1b[0;37m ${logOptions.message.content}`;
			} else if (logOptions.type == 'cmdErr') {
				logString = `\x1b[1;31m[Error > ${logOptions.message.event}]\x1b[0;37m ${logOptions.message.content}`;
			} else if (logOptions.type == 'runtimeErr') {
				logString = `\x1b[1;31m[Error > ${logOptions.message.event} > ${logOptions.message.errName}]\x1b[0;37m ${logOptions.message.content}`;
			} else if (logOptions.type == 'genWarn' || logOptions.type == 'warn') {
				logString = `\x1b[1;33m[Warning > ${logOptions.message.event}]\x1b[0;37m ${logOptions.message.content}`;
			} else if (logOptions.type == 'extra') {
				logString = `\x1b[0m\x1b[35m -> ${logOptions.message.event}\x1b[37m: ${logOptions.message.content}`;
			} else {
				return '\x1b[1;31m[Error > Logging] \x1b[0;37mLog type parameter is not in the valid range!\x1b[0m';
			}

			if (logOptions.message.cause) {
				logString += `\n\x1b[0m\x1b[35m -> Cause:\x1b[0;37m ${logOptions.message.cause}`;
			}

			if (logOptions.message.extra.length != 0 || logOptions.type != 'extra') {
				logOptions.message.extra.forEach((item) => {
					logString += `\n\x1b[0m\x1b[35m ->\x1b[37m ${item}`;
				});
			}

			logString += '\x1b[0m';
			return logString;
		}
	},

	/**
	 * Log to the console.
	 * @function
	 * @param {string} type - Specifies the type of the log. Cannot be omitted.
	 * @param {Object} message - Specifies the message. Cannot be omitted.
	 * @param {string} [message.event='Main'] - Specifies the event that this log was made in.
	 * @param {string} message.content - Specifies the log message content. Cannot be omitted.
	 * @param {string} message.errName - Specifies the error name. Can only be used with the genError, error and runtimeErr log types.
	 * @param {string} [message.cause] - Specifies the cause of the log.
	 * @param {Array} [message.extra] - Specify extra messages.
	 * @example
	 * // output a 'generic' log with the tag 'Main' with
	 * // 'test' as the message to the console
	 * log('generic' { event: 'Main', content: 'test' });
	 */
	log: function(type, message) {
		switch (type) {
			case 'genLog':
			case 'generic': console.log(self.createLogString(type, message)); break;
			case 'genErr':
			case 'error': console.error(self.createLogString(type, message)); break;
			case 'cmdErr': console.error(self.createLogString(type, message)); break;
			case 'genWarn':
			case 'warn': console.warn(self.createLogString(type, message)); break;
			case 'runtimeErr': console.error(self.createLogString(type, message)); break;
			case 'extra': console.log(self.createLogString(type, message)); break;
		}
	}
}