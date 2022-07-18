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
const process = require('process');

// custom modules
const { testFor } = require('./miscellaneous.js');

// exception function
function ConfigException(options) {
    this.name = 'ConfigException';
    this.message = testFor(options) !== 'String' && options.message ? options.message : options
    this.status = testFor(options) !== 'String' && options.status ? options.status : undefined
}

// base config
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

var self = module.exports = {
    getConfigPath: function() {
        return require.main.path;
    },
    validate: function() {
        let config
        try {
            config = JSON.parse(fs.readFileSync(`${self.getConfigPath()}/config.json`,'utf8'));
        } catch (e) {
            throw new ConfigException({ message: `Configuration file is non existent or malformed: ${e.message}`, status: e.code ? e.code : 'MALFORMED' });
            return e.code ? e.code : 'MALFORMED';
        }

        let debugStatus = ((config.debug || config.debug === false) || config.debug != undefined) ? true : false
        let githubAuthStatus = ((config.githubAuth || config.githubAuth === "") || config.githubAuth != undefined) ? true : false
        let specialBadgesStatus = (config.specialBadges || testFor(config.specialBadges) === 'Object') ? true : false

        if (!config.botAuth || !config.botID || !config.botOwner || !debugStatus || !githubAuthStatus || !specialBadgesStatus) {
            throw new ConfigException({ message: 'Configuration file is missing at least one vital element or is malformed.', status: 'MISSING' });
            return 'MISSING';
        }

        return true;

    },
    get: function() {
        try {
            self.validate();
        } catch (e) {
            console.log(e);
            return [];
        }

        const config = require(`${self.getConfigPath()}/config.json`);

        let values = [];
        for (let [key, value] in Object.entries(config)) {
            let i = 1;
            configValues.push({ key: key, value: value, index: i });
            i++;
        }

        return values;
    },
    edit: function(instructions) {
        let instructionsIntegrity = testFor(instructions) === 'Array' ? true : false

        if (!instructionsIntegrity) {
            throw new ConfigException('Invalid edit instructions');
            return false;
        }

        let validInstructions = ['c','e','w','sav','r'];

        try {
            self.validate();
        } catch (e) {
            if (e.status === 'MALFORMED' || e.status === 'ENOENT') {
                validInstructions = ['r']
            } else if (e.status === 'MISSING') {
                validInstructions = ['c','e','w','sav','r']
            } else {
                console.log(e);
                return;
            }
        }

        let config;
        try {
            config = JSON.parse(fs.readFileSync(`${self.getConfigPath()}/config.json`,'utf8'));
        } catch (e) {
            if (e.code && e.code === 'ENOENT') {
                validInstructions = ['r']
            } else {
                console.log(e);
                return;
            }
        }

        let invalidInstructions = [];

        instructions.forEach((item) => {
            if (validInstructions.find(i => i === item.o)) {
                if (item.o === 'c') {
                    if (config[item.key] !== undefined) {
                        config[item.key] = '';
                    }
                } else if (item.o === 'e') {
                    if (config[item.key] !== undefined) {
                        config[item.key] = item.value;
                    }
                } else if (item.o === 'w') {
                    config[item.key] = item.value;
                } else if (item.o === 'sav') {
                    fs.writeFileSync(`${self.getConfigPath()}/config.json`, JSON.stringify(config, undefined, 4));
                } else if (item.o === 'r') {
                    fs.writeFileSync(`${self.getConfigPath()}/config.json`, JSON.stringify(baseConfig, undefined, 4));
                    config = JSON.parse(fs.readFileSync(`${self.getConfigPath()}/config.json`,'utf8'));
                    validInstructions = ['c','e','w','sav','r'];
                }
            } else {
                invalidInstructions.push({ instruction: item });
            }
        })

        return invalidInstructions.length !== 0 ? invalidInstructions : true;
    },
}