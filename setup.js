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
const { gitRevision, askAsync, askAsyncFilter } = require('./lib/miscellaneous.js');
const configUtils = require('./lib/config.js');

var self = module.exports = {
    mainSetupFunction: async function() {
        log('genLog', { event: 'Setup', content: `Cryotheum Setup, revision \x1b[1;37m${gitRevision(true)}\x1b[0;37m` });

        let status;

        try {
            status = configUtils.validate();
            log('genWarn', { event: 'Setup', content: 'Configuration file found. Proceeding.' });
        } catch (e) {
            status = e.status;
            if (e.status === 'ENOENT') {
                log('genWarn', { event: 'Setup', content: 'Configuration file not found. Proceeding.' });
            } else if (e.status === 'MALFORMED') {
                log('genWarn', { event: 'Setup', content: 'Configuration file is malformed. Proceeding.' });
            } else if (e.status === 'MISSING') {
                log('genWarn', { event: 'Setup', content: 'Configuration file is missing vital elements or malformed. Proceeding.' });
            } else {
                log('runtimeErr', { errName: e.name, event: 'Setup', content: e.message });
                return;
            }
        }

        if (status === 'MALFORMED' || status === 'MISSING') {
            log('genWarn', { event: 'Setup', content: 'Configuration file is is missing vital elements or malformed! Do you want to overwrite the configuration file with the correct format?', extra: ['\x1b[1;37m1\x1b[0;37m. Yes', '\x1b[1;37m2\x1b[0;37m. No'] })
            let ans = askAsync(createLogString('extra', { event: 'Selection', content: '\x1b[0;90m(1 or 2) \x1b[0;37m' }), ['1', '2']);
            
            if (ans === '1') {
                try {
                    configUtils.edit([{ o: 'r' }]);
                    log('genLog', { event: 'Setup', content: 'Overwritten configurations with base configurations.' });
                } catch (e) {
                    log('runtimeErr', { errName: e.name, event: 'Setup', content: e.message });
                    return;
                }
            } else if (ans === '2') {
                log('genLog', { event: 'Setup', content: 'Setup completed.' });
                return;
            }

        } else if (status === 'ENOENT') {
            try {
                configUtils.edit([{ o: 'r' }]);
                log('genLog', { event: 'Setup', content: 'Wrote base configurations to configuration file.' });
            } catch (e) {
                log('runtimeErr', { errName: e.name, event: 'Setup', content: e.message });
                return;
            }
        }

        if (status === true) {
            log('genLog', { event: 'Setup', content: 'An existing valid configuration file was found. Are you sure that you want to proceed?', extra: ['\x1b[1;37m1\x1b[0;37m. Yes', '\x1b[1;37m2\x1b[0;37m. No'] })
            ans = askAsync(createLogString('extra', { event: 'Selection', content: '\x1b[0;90m(1 or 2) \x1b[0;37m' }), ['1', '2']);

            if (ans === '2') {
                log('genLog', { event: 'Setup', content: 'Setup completed.' })
                return;
            }
        }

        log('genLog', { event: 'Setup', content: 'Do you want a guided configuration setup or do you want to fill in the configuration file by yourself?', extra: ['\x1b[1;37m1\x1b[0;37m. I want a guided configuration setup', '\x1b[1;37m2\x1b[0;37m. I want to fill in the configuration file myself'] })
        ans = askAsync(createLogString('extra', { event: 'Selection', content: '\x1b[0;90m(1 or 2) \x1b[0;37m' }), ['1', '2']);
        if (ans === '1') {
            self.guided();
            return;
        } else if (ans === '2') {
            log('genLog', { event: 'Setup', content: 'Setup completed. Remember to fill in the configuration file!' });
            return;
        }

    },
    

    guided: function() {
        let ans = {};

        log('genLog', { event: 'Setup > Guided', content: 'Enter your Bot Token.' });
        ans.token = askAsync(createLogString('extra', { event: 'Input', content: '\x1b[0;90m(Bot Token) \x1b[0;37m' }));
        log('genLog', { event: 'Setup > Guided', content: 'Enter your Bot\'s Discord ID.' });
        ans.id = askAsyncFilter(createLogString('extra', { event: 'Input', content: '\x1b[0;90m(Bot Discord ID) \x1b[0;37m' }), /[a-zA-Z]/);
        log('genLog', { event: 'Setup > Guided', content: 'Enter your Discord ID.' });
        ans.owner = askAsyncFilter(createLogString('extra', { event: 'Input', content: '\x1b[0;90m(Your Discord ID) \x1b[0;37m' }), /[a-zA-Z]/);
        
        log('genLog', { event: 'Setup > Guided', content: 'Do you want to enable Debug mode? (Extra log messages)',  extra: ['\x1b[1;37m1\x1b[0;37m. Yes', '\x1b[1;37m2\x1b[0;37m. No'] });
        ans.debug = askAsync(createLogString('extra', { event: 'Selection', content: '\x1b[0;90m(1 or 2) \x1b[0;37m' }), ['1', '2']);
        ans.debug = ans.debug === '1' ? true : false

        log('genLog', { event: 'Setup > Guided', content: 'Do you want to enable Message Logging mode? (For debugging purposes)',  extra: ['\x1b[1;37m1\x1b[0;37m. Yes', '\x1b[1;37m2\x1b[0;37m. No'] });
        ans.logMessages = askAsync(createLogString('extra', { event: 'Selection', content: '\x1b[0;90m(1 or 2) \x1b[0;37m' }), ['1', '2']);
        ans.logMessages = ans.logMessages === '1' ? true : false
        
        log('genLog', { event: 'Setup > Guided', content: 'Do you want to add a GitHub Personal Access Token?', extra: ['\x1b[1;37m1\x1b[0;37m. Yes', '\x1b[1;37m2\x1b[0;37m. No'] });
        ans.github = askAsync(createLogString('extra', { event: 'Selection', content: '\x1b[0;90m(1 or 2) \x1b[0;37m' }), ['1', '2']);
        ans.github = ans.github === '1' ? true : false
        if (ans.github) {
            log('genLog', { event: 'Setup > Guided', content: 'Enter your GitHub Personal Access Token.' });
            ans.github = askAsync(createLogString('extra', { event: 'Input', content: '\x1b[0;90m(GitHub PAT) \x1b[0;37m' }));
        } else {
            ans.github = '';
        }

        console.log(configUtils.edit([
            { o: 'e', key: 'botAuth', value: ans.token },
            { o: 'e', key: 'botID', value: ans.id },
            { o: 'e', key: 'botOwner', value: ans.owner },
            { o: 'e', key: 'debug', value: ans.debug },
            { o: 'e', key: 'loggingMessages', value: ans.logMessages },
            { o: 'e', key: 'githubAuth', value: ans.github },
            { o: 'sav' }
        ]));

        log('genLog', { event: 'Setup > Guided', content: 'Your options has been saved to the configuration file.' });
    }
}

console.clear();
self.mainSetupFunction();