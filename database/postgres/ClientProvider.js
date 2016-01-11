var pg = require('pg');

var Disposable = require('common/lang/Disposable');

module.exports = function() {
    'use strict';

    var ClientProvider = Disposable.extend({
        init: function(host, database, username, password, port, applicationName) {
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