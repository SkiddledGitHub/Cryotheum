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
		};
	} 
}