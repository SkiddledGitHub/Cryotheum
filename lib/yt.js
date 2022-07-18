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

// 3rd party modules
const ytsr = require('ytsr');

var self = module.exports = {
    searchVideo: async function (q, limit) {
        let l = 30
        if (limit && !Number.isNaN(limit)) l = limit

        let url = await ytsr.getFilters(q);
        url = url.get('Type').get('Video').url;

        let res = await ytsr(url, { limit: l });
        return res.items
    },
    search: async function (q, limit) {
        let l = 30;
        if (limit && !Number.isNaN(limit)) l = limit

        let res = await ytsr(q, { limit: l })
        return res.items
    }
}