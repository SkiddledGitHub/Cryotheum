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

const axios = require('axios');

/**
 * This module's main exception function.
 * @function
 * @constructor
 * @param {Object} options - Options for the exception
 * @param {string} options.message - Message for the exception
 * @param {Object} options.res - Response data if any
 * @example
 * throw new InvidiousException({ message: `Invidious raised an exception: ${response.error}`, res: response });
 */
function InvidiousException(options) {
  this.message = options.message;
  this.name = 'InvidiousException';
  if (options.res) {
    this.res = options.res;
  };
}

var self = module.exports = {
    /**
     * Get Invidious HTTPS instances with API endpoints available.
     * @function
     * @async
     * @returns {Array} Returns an array with Invidious HTTPS instances and their URLs
     */
    getHttpsInstances: async function() {
        let instances = [];
        let response;

        await axios
          .get('https://api.invidious.io/instances.json?pretty=1&sort_by=type,users')
          .then(res => {
            response = res.data;
          })
          .catch(e => {
            throw new InvidiousException({ message: `Axios raised an exception: ${e.message}`, res: e.res });
            return undefined;
          })

          response.forEach((item) => {
            if (item[1].type === 'https' && item[1].api) {
                instances.push({ name: item[0], url: item[1].uri });
            }
          })

          return instances;
    },
    /**
     * Search using the Invidious search endpoint.
     * @function
     * @async
     * @param {string} query - Search query
     * @param {Object} options - Axios parameters
     * @param {Number} [options.page] - Change search page
     * @param {string} [options.sort_by] - Sort search results ("relevance", "rating", "upload_date", "view_count")
     * @param {string} [options.date] - Sort search results by creation date ("hour", "today", "week", "month", "year")
     * @param {string} [options.duration] - Sort search results by duration ("short", "long")
     * @param {string} [options.type] - Sort search results by their type ("video", "playlist", "channel", "all", default: video)
     * @param {string} [options.features] - Sort search results by their features ("hd", "subtitles", "creative_commons", "3d", "live", "purchased", "4k", "360", "location", "hdr", comma-seperated: hd,live,360)
     * @param {string} [options.region] - ISO 3166 country code (default: "US")
     * @param {Number} maximum - Maximum amount of search results to keep (default: 5)
     * @example
     * indivious.search('pewdiepie', { date: 'year' }, maximum: 4);
     * @returns {Array} An array with search results.
     */
    search: async function(query, options, maximum) {
        if (!query) {
            throw new InvidiousException({ message: 'Invidious raised an exception: You must provide a search query!' });
            return undefined;
        }
        let searchResults = []; 

        let maxQuery;
        if (!maximum) {
            maxQuery = 5;
        } else if (maximum > 30) {
            maxQuery = 30;
        } else {
            maxQuery = maximum;
        }

        let axiosOptions = { params: { pretty: 1, q: query } };
        if (options) {
            Object.keys(options).forEach((item) => {
                axiosOptions.params[item] = `${options[item]}`;
            })
        }

        let instances = await self.getHttpsInstances();

        let response;

        await axios
           .get(`${instances[0].url}/api/v1/search`, {}, axiosOptions)
           .then(res => {
                response = res.data;
           })
           .catch(e => {
                throw new InvidiousException({ message: `Axios raised an exception: ${e.message}`, res: e.res });
                return undefined;
           })
        if (response.error) {
            throw new InvidiousException({ message: `Invidious raised an exception: ${response.error}`, res: response });
            return undefined;
        }
        if (response.length === 0) {
            return undefined;
        }

        let resultData;
        response.forEach((item, index) => {
            if (!index === maxQuery - 1 && !item.isUpcoming && !item.premium) {
                if (item.type === 'video') {
                    resultData = {
                        type: item.type,
                        metadata: {
                            title: item.title,
                            id: item.videoId,
                            viewCount: item.viewCount,
                            length: item.lengthSeconds,
                            thumbnails: item.videoThumbnails,
                            published: {
                                timestamp: item.published,
                                text: item.publishedText
                            }
                        },
                        author: {
                            name: item.author,
                            id: item.authorId,
                            url: item.authorUrl
                        }
                    };

                } else if (item.type === 'playlist') {
                    resultData = {
                        type: item.type,
                        metadata: {
                            title: item.title,
                            id: item.playlistId,
                            thumbnails: item.playlistThumbnail,
                            videoCount: item.videoCount
                        },
                        author: {
                            name: item.author,
                            id: item.authorId,
                            url: item.authorUrl,
                            verified: item.authorVerified
                        },
                        videos: []
                    };

                    item.videos.forEach((videoItem) => {
                        resultData.videos.push({
                            title: videoItem.title,
                            id: videoItem.videoId,
                            thumbnails: videoItem.videoThumbnails,
                            length: videoItem.lengthSeconds
                        })
                    })

                } else if (item.type === 'channel') {
                    resultData = {
                        type: item.type,
                        author: {
                            name: item.author,
                            id: item.authorId,
                            url: item.authorUrl,
                            verified: item.authorVerified,
                            thumbnails: item.authorThumbnails,
                            autoGenerated: item.autoGenerated,
                            subCount: item.subCount,
                            videoCount: item.videoCount,
                            description: item.description
                        }
                    };
                }
            }
        })

        return searchResults;
    },
    /**
     * Get a video's data.
     * @function
     * @async
     * @param {string} videoID - The video's ID.
     * @example
     * invidious.getVideo('eHL0r0r69cE');
     * @returns {Object} Video data
     */
    getVideo: async function(videoID) {
        if (!videoID) {
            throw new InvidiousException({ message: 'Invidious raised an exception: You must provide a video ID!' });
            return undefined;
        }
        let instances = await self.getHttpsInstances();

        let response;

        await axios
            .get(`${instances[0].url}/api/v1/videos/${videoID}`, {}, { params: { pretty: 1 } })
            .then(res => {
                response = res.data;
            })
            .catch(e => {
                throw new InvidiousException({ message: `Axios raised an exception: ${e.message}`, res: e.res });
                return undefined;
            })
        if (response.error) {
            throw new InvidiousException({ message: `Invidious raised an exception: ${response.error}`, res: response });
            return undefined;
        }

        let videoData = {
            type: response.type,
            metadata: {
                title: response.title,
                id: response.videoId,
                thumbnails: response.videoThumbnails,
                description: response.description,
                published: {
                    timestamp: response.published,
                    text: response.publishedText
                },
                keywords: response.keywords,
                viewCount: response.viewCount, likeCount: response.likeCount,
                paid: response.paid, premium: response.premium,
                allowedRegions: response.allowedRegions,
                genre: response.genre,
                length: response.lengthSeconds,
                liveNow: response.liveNow, upcoming: response.isUpcoming
            },
            video: {
                dash: response.dashUrl,
                adaptive: response.adaptiveFormats,
                streams: response.formatStreams,
                captions: response.captions
            },
            author: {
                name: response.author,
                subCount: response.subCountText,
                id: response.authorId,
                url: response.authorUrl,
                thumbnails: response.authorThumbnails
            }
        };

        return videoData;
    },
    /**
     * Get a playlist's data.
     * @function
     * @async
     * @param {string} playlistID - The playlist's ID
     * @example
     * invidious.getPlaylist('PLYH8WvNV1YEnLCzUDWueIZQXDNhqLKywk');
     * @returns {Object} Playlist data
     */
    getPlaylist: async function(playlistID) {
        if (!playlistID) {
            throw new InvidiousException({ message: 'Invidious raised an exception: You must provide a playlist ID!' });
            return undefined;
        }
        let instances = await self.getHttpsInstances();

        let response;

        await axios
            .get(`${instances[0].url}/api/v1/playlists/${playlistID}`, {}, { params: { pretty: 1 } })
            .then(res => {
                response = res.data;
            })
            .catch(e => {
                throw new InvidiousException({ message: `Axios raised an exception: ${e.message}`, res: e.res });
                return undefined;
            })
        if (response.error) {
            throw new InvidiousException({ message `Invidious raised an exception: ${response.error}`, res: response });
            return undefined;
        }

        let playlistData = {
            type: response.type,
            metadata: {
                title: response.title,
                id: response.playlistId,
                thumbnail: response.playlistThumbnail,
                description: response.description,
                videoCount: response.videoCount,
                viewCount: response.viewCount,
                updated: response.updated
            },
            author: {
                name: response.author,
                id: response.authorId,
                url: response.authorUrl
                thumbnails: response.authorThumbnails,
            },
            videos: []
        };

        response.videos.forEach((item) => {
            playlistData.videos.push({
                metadata: {
                    title: item.title,
                    id: item.videoId,
                    thumbnails: item.videoThumbnails,
                    length: item.lengthSeconds,
                    index: item.index
                },
                author: {
                    name: item.author,
                    id: item.authorId,
                    url: item.authorUrl
                }
            })
        })

        return playlistData;
    },
    /**
     * Get a channel's data
     * @function
     * @async
     * @param {string} channelID - The channel's ID
     * @param {Object} options - Axios parameters
     * @param {string} [options.sort_by] - Sort channel ("newest", "oldest", "popular", default: newest)
     * @example
     * invidious.getChannel('UC-lHJZR3Gqxm24_Vd_AJ5Yw');
     * @returns {Object} Channel's data
     */
    getChannel: async function(channelID, options) {
        if (!channelID) {
            throw new InvidiousException({ message: 'Invidious raised an exception: You must provide a channel ID!' });
            return undefined;
        }
        let instances = await self.getHttpsInstances();

        let response;

        let axiosOptions = { params: { pretty: 1 } };
        if (options) {
            Object.keys(options).forEach((item) => {
                axiosOptions.params[item] = `${options[item]}`;
            })
        }

        await axios
            .get(`${instances[0].url}/api/v1/channels/${channelID}`, {}, axiosOptions)
            .then(res => {

            })
            .catch(e => {
                throw new InvidiousException({ message: `Axios raised an exception: ${e.message}`, res: e.res });
                return undefined;
            })
        if (response.error) {
            throw new InvidiousException({ message: `Invidious raised an exception: ${response.error}`, res: response })
            return undefined;
        };

        let channelData = {
            author: {
                name: response.author,
                id: response.authorId,
                url: response.authorUrl,
                banners: response.authorBanners,
                thumbnails: response.authorThumbnails,
                subCount: response.subCount,
                views: response.totalViews,
                joined: response.joined,
                autoGenerated: response.autoGenerated,
                familyFriendly: response.familyFriendly,
                description: response.description,
                allowedRegions: response.allowedRegions
            },
            misc: {
                latestVideos: [],
                relatedChannels: []
            }
        };

        response.latestVideos.forEach((item) => {
            channelData.misc.latestVideos.push({
                metadata: {
                    title: item.title,
                    id: item.videoId,
                    thumbnails: item.videoThumbnails,
                    viewCount: item.viewCount,
                    published: {
                        timestamp: item.published,
                        text: item.publishedText
                    },
                    length: item.lengthSeconds,
                    live: item.liveNow,
                    premium: item.premium,
                    upcoming: item.isUpcoming
                },
                author: {
                    name: item.author,
                    id: item.authorId,
                    url: item.authorUrl
                }
            })
        })

        response.relatedChannels.forEach((item) => {
            channelData.misc.relatedChannels.push({
                author: {
                    name: item.author,
                    id: item.authorId,
                    url: item.authorUrl,
                    thumbnails: item.authorThumbnails
                }
            })
        })

        return channelData;
    },
    /**
     * Get channel's videos.
     * @function
     * @async
     * @param {string} channelID - The channel's ID
     * @param {Object} options - Axios parameters
     * @param {Number} [options.page] - Select page
     * @param {string} [options.sort_by] - Sort videos ("newest", "oldest", "popular", default: newest)
     * @example
     * invidious.getChannelVideos('UC-lHJZR3Gqxm24_Vd_AJ5Yw');
     * @return {Array} An array with up to 30 channel videos
     */
    getChannelVideos: async function(channelID, options) {
        if (!channelID) {
            throw new InvidiousException({ message: 'Invidious raised an exception: You must provide a channel ID!' });
            return undefined;
        }
        let instances = await self.getHttpsInstances();

        let response;

        let axiosOptions = { params: { pretty: 1 } };
        if (options) {
            Object.keys(options).forEach((item) => {
                axiosOptions.params[item] = `${options[item]}`;
            })
        }

        await axios
            .get(`${instances[0].url}/api/v1/channels/videos/${channelID}`, {}, axiosOptions)
            .then(res => {
                response = res.data;
            })
            .catch(e => {
                throw new InvidiousException({ message: `Axios raised an exception: ${e.message}`, res: e.res });
                return undefined;
            })
        if (response.error) {
            throw new InvidiousException({ message: `Invidious raised an exception: ${response.error}`, res: response });
            return undefined;
        }

        let channelVideos = [];
        response.forEach((item) => {
            channelVideos.push({
                metadata: {
                    title: item.title,
                    id: item.videoId,
                    thumbnails: item.videoThumbnails,
                    description: item.description,
                    viewCount: item.videoCount,
                    published: {
                        timestamp: item.published,
                        text: item.publishedText
                    },
                    paid: item.paid,
                    premium: item.premium
                },
                author: {
                    name: item.author,
                    id: item.authorId,
                    url: item.authorUrl
                }
            })
        })

        return channelVideos;
    },
    /**
     * Get channel's latest videos.
     * @function
     * @async
     * @param {string} channelID - The channel's ID
     * @example
     * invidious.getChannelLatestVideos('UC-lHJZR3Gqxm24_Vd_AJ5Yw');
     * @return {Array} An array with up to 30 channel latest videos
     */
    getChannelLatestVideos: async function(channelID) {
        if (!channelID) {
            throw new InvidiousException({ message: 'Invidious raised an exception: You must provide a channel ID!' });
            return undefined;
        }
        let instances = await self.getHttpsInstances();

        let response;

        await axios
            .get(`${instances[0].url}/api/v1/channels/latest/${channelID}`, {}, { params: { pretty: 1 } })
            .then(res => {
                response = res.data;
            })
            .catch(e => {
                throw new InvidiousException({ message: `Axios raised an exception: ${e.message}`, res: e.res });
                return undefined;
            })
        if (response.error) {
            throw new InvidiousException({ message: `Invidious raised an exception: ${response.error}`, res: response });
            return undefined;
        }

        let latestVideos = [];
        response.forEach((item) => {
            latestVideos.push({
                metadata: {
                    title: item.title,
                    id: item.videoId,
                    thumbnails: item.videoThumbnails,
                    description: item.description,
                    published: {
                        timestamp: item.published,
                        text: item.publishedText
                    },
                    viewCount: item.viewCount,
                    length: item.lengthSeconds,
                    paid: item.paid,
                    premium: item.premium
                },
                author: {
                    id: item.authorId,
                    url: item.authorUrl
                }
            })
        })

        return latestVideos;
    },
    /**
     * Get channel's playlists.
     * @function
     * @async
     * @param {string} channelID - The channel's ID
     * @param {Object} options - Axios parameters
     * @param {Number} [options.continuation] - Continuation string
     * @param {string} [options.sort_by] - Sort videos ("oldest", "newest", "last")
     * @example
     * invidious.getChannelVideos('UC-lHJZR3Gqxm24_Vd_AJ5Yw');
     * @returns {Array} An array with data with up to 29 channel playlists
     */
    getChannelPlaylists: async function(channelID, options) {
        if (!channelID) {
            throw new InvidiousException({ message: 'Invidious raised an exception: You must provide a channel ID!' });
            return undefined;
        }
        let instances = await self.getHttpsInstances();

        let response;

        let axiosOptions = { params: { pretty: 1 } };
        if (options) {
            Object.keys(options).forEach((item) => {
                axiosOptions.params[item] = `${options[item]}`;
            })
        }

        await axios
            .get(`${instances[0].url}/api/v1/channels/playlists/${channelID}`, {}, axiosOptions)
            .then(res => {
                response = res.data;
            })
            .catch(e => {
                throw new InvidiousException({ message: `Axios raised an exception: ${e.message}`, res: e.res });
                return undefined;
            })
        if (response.error) {
            throw new InvidiousException({ message: `Invidious raised an exception: ${response.error}`, res: response });
            return undefined;
        }

        let channelPlaylists = [];
        let continuation = undefined;
        if (response.continuation) {
            continuation = response.continuation;
        }

        response.playlists.forEach((item) => {
            channelPlaylists.push({
                type: item.type,
                metadata: {
                    title: item.title,
                    id: item.playlistId,
                    thumbnail: item.playlistThumbnail,
                    videoCount: item.videoCount
                },
                author: {
                    name: item.author,
                    id: item.authorId,
                    url: item.authorUrl,
                    verified: item.authorVerified
                }
            })
        })

        return { playlists: channelPlaylists, continuation: continuation };
    }
}