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
    }
}