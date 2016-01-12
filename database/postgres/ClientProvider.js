var pg = require('pg');

var assert = require('common/lang/assert');
var Disposable = require('common/lang/Disposable');

module.exports = function() {
    'use strict';

    var ClientProvider = Disposable.extend({
        init: function(host, database, username, password, port, applicationName) {
            assert.argumentIsRequired(host, 'host', String);
			assert.argumentIsRequired(database, 'database', String);
			assert.argumentIsRequired(username, 'username', String);
			assert.argumentIsRequired(password, 'password', String);
			assert.argumentIsOptional(port, 'port', Number);
			assert.argumentIsOptional(applicationName, 'applicationName', String);

			this._super();

            this._configuration = {
                host: host,
                port: port || 5432,
                database: database,
                user: username,
                password: password,
                application_name: applicationName || 'pg-javascript-client'
            };
        },

        getClient: function() {
            return this._getClient();
        },

        _getClient: function() {
            return null;
        },

        _getConfiguration: function() {
            return this._configuration;
        },

        toString: function() {
            return '[ClientProvider]';
        }
    });

    return ClientProvider;
}();