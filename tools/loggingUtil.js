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
	log: function(type, message) {
		switch (type) {
			case 'genErr': console.error(` \x1b[1;31m=> Error: ${message}\x1b[0m`); break;
			case 'cmdErr': console.error(` \x1b[1;31m=> ${message.errtitle}: ${message.content}\x1b[0m`); break;
			case 'genWarn': console.warn(` \x1b[1;33m=> Warning: ${message}\x1b[0m`); break;
			case 'genLog': console.log(` \x1b[1;32m=> ${message}\x1b[0m`); break;
		}
	}
}