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

		readConfigurationFile(filePath) {
			return readConfigurationFile(this._configuration.server.path, filePath, this._name);
		}

		static initialize(applicationPath, version) {
			assert.argumentIsRequired(applicationPath, 'applicationPath', String);
			assert.argumentIsRequired(version, 'version', String);

			let name;

			if (is.object(process) && is.object(process.env) && is.string(process.env.NODE_ENV)) {
				name = process.env.NODE_ENV;
			} else {
				name = 'development';
			}

			const configuration = readConfigurationFile(applicationPath, 'config/config.yml', name);

			configuration.server = configuration.server || {};
			configuration.server.path = configuration.server.path || applicationPath;

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

	function readConfigurationFile(applicationPath, filePath, name) {
		return configurator.load(path.resolve(applicationPath, filePath), name);
	}

	return Environment;
})();