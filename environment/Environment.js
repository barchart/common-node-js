var _ = require('lodash');
var Class = require('class.extend');
var configurator = require('node-yaml-config');
var path = require('path');

var assert = require('common/lang/assert');

module.exports = function() {
	'use strict';

    var Environment = Class.extend({
        init: function (environmentName, configuration, version) {
			assert.argumentIsRequired(environmentName, 'environmentName', String);
			assert.argumentIsRequired(configuration, 'configuration', Object);
			assert.argumentIsRequired(version, 'version', String);

            this._name = environmentName;
            this._configuration = configuration;
            this._version = version;
        },

        getName: function() {
            return this._name;
        },

        getConfiguration: function() {
            return this._configuration;
        },

        getVersion: function() {
            return this._version;
        },

        getIsProduction: function() {
            return this._name === 'production';
        }
    });

	var instance = null;

	Environment.initialize = function(configurationPath, version) {
		assert.argumentIsRequired(configurationPath, 'configurationPath', String);
		assert.argumentIsRequired(version, 'version', String);

		var name;

		if (_.isObject(process) && _.isObject(process.env) && _.isString(process.env.NODE_ENV)) {
			name = process.env.NODE_ENV;
		} else {
			name = 'development';
		}

		var configuration = configurator.load(path.resolve(configurationPath + '/config/config.yml'), name);

		configuration.server = configuration.server || { };
		configuration.server.path = configuration.server.path || configurationPath;

		instance = new Environment(name, configuration, version);

		return instance;
	};

	Environment.getInstance = function() {
		if (instance === null) {
			throw new Error('The environment has not been initialized.');
		}

		return instance;
	};

    return Environment;
}();