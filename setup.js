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

// node modules
const fs = require('node:fs');

// 3rd party modules
const prompt = require('prompt-sync')({sigint: true});

// custom modules
const { log, createLogString } = require('./lib/logging.js');
const { gitRevision } = require('./lib/miscellaneous.js');

const baseConfig = {
    "botAuth": "",
    "botID": "",
    "botOwner": "",
    "loggingMessages": false,
    "debug": false,
    "githubAuth": "",
    "specialBadges": {
    }
}

console.clear();

var self = module.exports = {
    mainSetupFunction: async function() {
        let config;
        log('genLog', { event: 'Setup', content: `Cryotheum Setup, revision \x1b[1;37m${gitRevision(true)}\x1b[0;37m` });

        try {
            config = JSON.parse(fs.readFileSync('./config.json','utf8'));
            log('genWarn', { event: 'Setup', content: 'Configuration file found. Proceeding.' });
        } catch (e) {
            if (e.code && e.code === 'ENOENT') {
                log('genWarn', { event: 'Setup', content: 'Configuration file not found. Proceeding.' });
            } else {
                log('runtimeErr', { errName: e.name, event: 'Setup', content: e.message });
                return;
            }
        }

        if (config) {
            if (!(config.botAuth || config.botID || config.botOwner || (config.loggingMessages === true || config.loggingMessages === false) || (config.debug === true || config.debug === false) || !(config.githubAuth === '' || config.githubAuth === undefined) || (config.specialBadges && config.specialBadges.constructor.name === 'Object' && (Object.keys(config.specialBadges).length >= 0)))) {
                log('genWarn', { event: 'Setup', content: 'Configuration file is invalid! Do you want to overwrite the configuration file with the correct format?', extra: ['\x1b[1;37m1\x1b[0;37m. Yes', '\x1b[1;37m2\x1b[0;37m. No'] })
                let ans = self.askAsync(createLogString('extra', { event: 'Selection', content: '\x1b[0;90m(1 or 2) \x1b[0;37m' }), ['1', '2']);
                if (ans === '1') {
                    try {
                        fs.writeFileSync('./config.json', JSON.stringify(baseConfig, undefined, 4));
                        log('genLog', { event: 'Setup', content: 'Overwritten configurations with base configurations.' });
                        config = JSON.parse(fs.readFileSync('./config.json','utf8'));
                    } catch (e) {
                        log('runtimeErr', { errName: e.name, event: 'Setup', content: e.message });
                        return;
                    }
                } else if (ans === '2') {
                    log('genLog', { event: 'Setup', content: 'Setup completed.' });
                    return;
                }
            }
        } else {
            try {
                fs.writeFileSync('./config.json', JSON.stringify(baseConfig, undefined, 4));
                log('genLog', { event: 'Setup', content: 'Wrote base configurations to configuration file.' });
                config = JSON.parse(fs.readFileSync('./config.json','utf8'));
            } catch (e) {
                log('runtimeErr', { errName: e.name, event: 'Setup', content: e.message });
                return;
            }
        }

        if (config) {
            log('genLog', { event: 'Setup', content: 'Do you want a guided configuration setup or do you want to fill in the configuration file by yourself?', extra: ['\x1b[1;37m1\x1b[0;37m. I want a guided configuration setup', '\x1b[1;37m2\x1b[0;37m. I want to fill in the configuration file myself'] })
            ans = self.askAsync(createLogString('extra', { event: 'Selection', content: '\x1b[0;90m(1 or 2) \x1b[0;37m' }), ['1', '2']);
            if (ans === '1') {
                self.guided(config);
                fs.writeFileSync('./config.json', JSON.stringify(config, undefined, 4));
                return;
            } else if (ans === '2') {
                log('genLog', { event: 'Setup', content: 'Setup completed. Remember to fill in the configuration file!' });
                return;
            }
        }

    },
    askAsync: function(p, range, options) {
        let ans = prompt(p);
        if (options) {
            if (options.lower) ans = ans.toLowerCase();
        }
        let search;
        if (range) {
            search = range.find(item => item === ans);
        }
        if (options) {
            if (options.literal === 'boolean') {
                if (ans.toLowerCase() === 'true') {
                    ans = true;
                } else if (ans.toLowerCase() === 'false') {
                    ans = false;
                }
            }
        }
        if (range && !search) {
            log('genErr', { errName: 'Setup', content: 'Invalid option!' });
            ans = self.askAsync(p, range);
        }
        return ans;
    },
    askAsyncFilter: function(p, filter, options) {
        let ans = prompt(p);
        if (options) {
            if (options.lower) ans = ans.toLowerCase();
        }
        let res;
        if (filter) {
            res = filter.test(ans);
        }
        if (options) {
            if (options.literal === 'boolean') {
                if (ans.toLowerCase() === 'true') {
                    ans = true;
                } else if (ans.toLowerCase() === 'false') {
                    ans = false;
                }
            }
        }
        if (filter && res) {
            log('genErr', { errName: 'Setup', content: 'Does not look like a valid option.' });
            ans = self.askAsyncFilter(p, range);
        }
        return ans;
    },
    getConfig: function(config) {
        let configValues = [];
        for (let [key, value] in Object.entries(config)) {
            let i = 1;
            configValues.push({ index: i, key: key, value: value });
            i++;
        }
        return configValues;
    },
    editConfig: function(instructions, config) {
        instructions.forEach((item) => {
            if (item.op === 'clear') {
                config[item.key] = '';
            } else if (item.op === 'edit') {
                config[item.key] = item.value;
            }
        })

        return;
    },
    guided: function(config) {
        let ans = {};
        log('genLog', { event: 'Setup > Guided', content: 'Enter your Bot Token.' });
        ans.token = self.askAsync(createLogString('extra', { event: 'Input', content: '\x1b[0;90m(Bot Token) \x1b[0;37m' }));
        log('genLog', { event: 'Setup > Guided', content: 'Enter your Bot\'s Discord ID.' });
        ans.id = self.askAsyncFilter(createLogString('extra', { event: 'Input', content: '\x1b[0;90m(Bot Discord ID) \x1b[0;37m' }), /[a-zA-Z]/);
        log('genLog', { event: 'Setup > Guided', content: 'Enter your Discord ID.' });
        ans.owner = self.askAsyncFilter(createLogString('extra', { event: 'Input', content: '\x1b[0;90m(Your Discord ID) \x1b[0;37m' }), /[a-zA-Z]/);
        
        log('genLog', { event: 'Setup > Guided', content: 'Do you want to enable Debug mode? (Extra log messages)',  extra: ['\x1b[1;37m1\x1b[0;37m. Yes', '\x1b[1;37m2\x1b[0;37m. No'] });
        ans.debug = self.askAsync(createLogString('extra', { event: 'Selection', content: '\x1b[0;90m(1 or 2) \x1b[0;37m' }), ['1', '2']);
        if (ans.debug === '1') ans.debug = true;
        if (ans.debug === '2') ans.debug = false;

        log('genLog', { event: 'Setup > Guided', content: 'Do you want to enable Message Logging mode? (For debugging purposes)',  extra: ['\x1b[1;37m1\x1b[0;37m. Yes', '\x1b[1;37m2\x1b[0;37m. No'] });
        ans.logMessages = self.askAsync(createLogString('extra', { event: 'Selection', content: '\x1b[0;90m(1 or 2) \x1b[0;37m' }), ['1', '2']);
        if (ans.logMessages === '1') ans.logMessages = true;
        if (ans.logMessages === '2') ans.logMessages = false;
        
        log('genLog', { event: 'Setup > Guided', content: 'Do you want to add a GitHub Personal Access Token?', extra: ['\x1b[1;37m1\x1b[0;37m. Yes', '\x1b[1;37m2\x1b[0;37m. No'] });
        ans.github = self.askAsync(createLogString('extra', { event: 'Selection', content: '\x1b[0;90m(1 or 2) \x1b[0;37m' }), ['1', '2']);
        if (ans.github === '1') {
            log('genLog', { event: 'Setup > Guided', content: 'Enter your GitHub Personal Access Token.' });
            ans.github = self.askAsync(createLogString('extra', { event: 'Input', content: '\x1b[0;90m(GitHub PAT) \x1b[0;37m' }));
        } else {
            ans.github = '';
        }

        self.editConfig([
            { op: 'edit', key: 'botAuth', value: ans.token },
            { op: 'edit', key: 'botID', value: ans.id },
            { op: 'edit', key: 'botOwner', value: ans.owner },
            { op: 'edit', key: 'debug', value: ans.debug },
            { op: 'edit', key: 'loggingMessages', value: ans.logMessages },
            { op: 'edit', key: 'githubAuth', value: ans.github }
        ], config)

        log('genLog', { event: 'Setup > Guided', content: 'Your options has been saved to the configuration file.' });
    }
}

self.mainSetupFunction();