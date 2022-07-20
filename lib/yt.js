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