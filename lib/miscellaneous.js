/**
 * @license
 * @copyright Copyright 2022 ZenialDev
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

// node modules
const fs = require('node:fs');

// 3rd party modules
const prompt = require('prompt-sync')({sigint: true});

// discord.js modules
const { Routes } = require('discord-api-types/v9');

function MiscellaneousException(options) {
    this.name = 'MiscellaneousException';
    if (options.message) {
        this.message = options.message;
    } else {
        this.message = 'No message provided';
    }
    if (options.reason) {
        this.reason = options.reason;
    } else {
        this.reason = 'No reason provided';
    }
}

var self = module.exports = {
	/**
	 * Returns constructor's name
	 * @function
	 * @param {*} data - Any data
	 * @example
	 * // should return 'String'
	 * testFor('abcdefg');
	 * // should return 'Object'
	 * testFor({ a: 'b', c: 3 });
	 * // should return 'Array'
	 * testFor([ 'a', 'b', 'c' ]);
	 * @returns {string} Constructor's name if present - else it's undefined
	 */
	testFor: function(data) {
		if (!data.constructor.name) {
			return undefined;
		} else {
			return data.constructor.name;
		}
	},
    /**
     * Returns full time
     * @function
     * @param {Number} seconds - The number of seconds to convert
     * @example
     * // should return { minutes: 1, seconds: 6, hours: 1 }
     * getFullTime(3666);
     * @returns {Object} An object with the number of hours, minutes and seconds in the number of provided seconds
     */
    getFullTime: function(seconds) {
        if (seconds < 1) {
            return {
                hours: 0,
                minutes: 0,
                seconds: 0,
            }
        }

        if (seconds < 60) {
            return {
                hours: 0,
                minutes: 0,
                seconds: seconds
            }
        }

        let fullTime = {};
        fullTime.minutes = Math.round(seconds / 60);
        if (fullTime.minutes) {
            if ((fullTime.minutes * 60) < seconds) {
                fullTime.seconds = seconds - (fullTime.minutes * 60);
            } else if ((fullTime.minutes * 60) == seconds) {
                fullTime.seconds = 0;
            } else {
                fullTime.seconds = 0;
            }
        }

        if (fullTime.minutes > 60) {
            fullTime.hours = Math.round(fullTime.minutes / 60);
            if ((fullTime.hours * 60) < fullTime.minutes) {
                fullTime.minutes = fullTime.minutes - (fullTime.hours * 60);
            } else if ((fullTime.hours * 60) == fullTime.minutes) {
                fullTime.minutes = 0;
            } else {
                fullTime.minutes = 0;
            }
        } else {
            fullTime.hours = 0;
        }

        return fullTime;
    },
    formatTime: function(time) {
        let formattedTime = {};
        if (time.hours < 10) {
            formattedTime.hours = `0${time.hours}`;
        } else {
            formattedTime.hours = `${time.hours}`;
        }
        if (time.minutes < 10) {
            formattedTime.minutes = `0${time.minutes}`;
        } else {
            formattedTime.minutes = `${time.minutes}`;
        }
        if (time.seconds < 10) {
            formattedTime.seconds = `0${time.seconds}`;
        } else {
            formattedTime.seconds = `${time.seconds}`;
        }

        if (time.hours && time.minutes && time.seconds) {
            return `${formattedTime.hours}:${formattedTime.minutes}:${formattedTime.seconds}`;
        } else if (time.hours && time.minutes && !time.seconds) {
            return `${formattedTime.hours}:${formattedTime.minutes}:${formattedTime.seconds}`;
        } else if (time.hours && !time.minutes && !time.seconds) {
            return `${formattedTime.hours}:${formattedTime.minutes}:${formattedTime.seconds}`;
        } else if (time.hours && !time.minutes && time.seconds) {
            return `${formattedTime.hours}:${formattedTime.minutes}:${formattedTime.seconds}`;
        } else if (!time.hours && time.minutes && time.seconds) {
            return `${formattedTime.minutes}:${formattedTime.seconds}`;
        } else if (!time.hours && !time.minutes && time.seconds) {
            return `${formattedTime.seconds} seconds`;
        } else if (!time.hours && time.minutes && !time.seconds) {
            return `${formattedTime.minutes}:${formattedTime.seconds}`;
        } else if (!time.hours && !time.minutes && !time.seconds) {
            return `Now`;
        }
    },
    gitRevision: function(short) {
        let head;
        let revision;
        let gitDir;

        if (fs.readdirSync('../').find(item => item === '.git')) {
            gitDir = '../.git';
        } else if (fs.readdirSync('./').find(item => item === '.git')) {
            gitDir = '.git';
        }

        try {
            head = fs.readFileSync(`${gitDir}/HEAD`,'utf8').replace(/ref: /, '').trim();
        } catch (e) {
            head = undefined;
        };

        if (head) {
            revision = fs.readFileSync(`${gitDir}/${head}`,'utf8').trim();

            if (short && revision) {
                revision = revision.slice(0,7);
            }
        }

        if (revision) {
            return revision;
        } else {
            return 'Unknown';
        }
    },
    commandsManagement: async function(options) {
        const { log } = require('./logging.js');
        if (!options.method) {
            throw new MiscellaneousException({ message: 'Miscellaneous Library raised an exception', reason: 'Missing method' });
            return false;
        } else if (!(options.method == 'refresh') || !(options.method !== 'destroy')) {
            throw new MiscellaneousException({ message: 'Miscellaneous Library raised an exception', reason: 'Invalid method' });
            return false;
        }

        if ((!options.rest || !options.botID || !options.commands) && options.method === 'refresh') {
            throw new MiscellaneousException({ message: 'Miscellaneous Library raised an exception', reason: 'Missing REST object, Bot ID or Commands object' });
            return false;
        } else if ((!options.rest || !options.botID) && options.method === 'destroy') {
            throw new MiscellaneousException({ message: 'Miscellaneous Library raised an exception', reason: 'Missing REST object, or Commands object' });
            return false;
        }

        await (async () => {
            try {

                let tempUIString = {};
                if (options.method === 'refresh') {
                    tempUIString.a = 'Refresh';
                    tempUIString.b = 'It might take a few minutes for new commands to show up.'
                } else if (options.method === 'destroy') {
                    tempUIString.a = 'Destroy';
                    tempUIString.b = 'It might take a few minutes for commands to be removed';
                }

                log('genLog', { event: `Commands > ${tempUIString.a}`, content: `${tempUIString.a}ing slash commands` });
                
                if (options.method === 'refresh') {
                    await options.rest.put(Routes.applicationCommands(options.botID), { body: options.commands });
                } else if (options.method === 'destroy') {
                    await options.rest.put(Routes.applicationCommands(options.botID), { body: [] });
                }

                log('genLog', { event: `Commands > ${tempUIString.a}`, content: `${tempUIString.a}ed slash commands. ${tempUIString.b}` });
            } catch (e) {
                log('runtimeErr', { event: `${tempUIString.a}`, errName: e.name, content: e.message });
                throw new MiscellaneousException({ message: 'Miscellaneous Library raised an exception', reason: e.message })
            }

        })();

        return true;
    },
    askAsync: function(p, range, options) {
        const { log } = require('./logging.js');
        let ans = prompt(p);
        if (options) {
            if (options.lower) ans = ans.toLowerCase();
        }
        let search;
        if (range) {
            search = range.find(item => item === ans);
        }
        if (range && !search) {
            log('genErr', { errName: 'Setup', content: 'Invalid option!' });
            ans = self.askAsync(p, range);
        }
        return ans;
    },
    askAsyncFilter: function(p, filter, options) {
        const { log } = require('./logging.js');
        let ans = prompt(p);
        if (options) {
            if (options.lower) ans = ans.toLowerCase();
        }
        let res;
        if (filter) {
            res = filter.test(ans);
        }
        if (filter && res) {
            log('genErr', { errName: 'Setup', content: 'Does not look like a valid option.' });
            ans = self.askAsyncFilter(p, range);
        }
        return ans;
    },
}