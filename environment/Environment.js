var configurator = require('node-yaml-config');
var path = require('path');

var assert = require('common/lang/assert');
var is = require('common/lang/is');

module.exports = (() => {
	'use strict';

	let instance = null;

	class Environment {
		constructor(environmentName, configuration, version) {
			assert.argumentIsRequired(environmentName, 'environmentName', String);
			assert.argumentIsRequired(configuration, 'configuration', Object);
			assert.argumentIsRequired(version, 'version', String);

			this._name = environmentName;
			this._configuration = configuration;
			this._version = version;
		}

		getName() {
			return this._name;
		}

		getConfiguration() {
			return this._configuration;
		}

		getVersion() {
			return this._version;
		}

		getIsProduction() {
			return this._name === 'production';
		}

		static initialize(configurationPath, version) {
			assert.argumentIsRequired(configurationPath, 'configurationPath', String);
			assert.argumentIsRequired(version, 'version', String);

			let name;

			if (is.object(process) && is.object(process.env) && is.string(process.env.NODE_ENV)) {
				name = process.env.NODE_ENV;
			} else {
				name = 'development';
			}

			const configuration = configurator.load(path.resolve(configurationPath + '/config/config.yml'), name);

			configuration.server = configuration.server || {};
			configuration.server.path = configuration.server.path || configurationPath;

			instance = new Environment(name, configuration, version);

			return instance;
		}

		static getInstance() {
			if (instance === null) {
				throw new Error('The environment has not been initialized.');
			}

			return instance;
		}
	}

	return Environment;
})();