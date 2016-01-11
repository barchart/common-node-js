var Class = require('class.extend');
var pg = require('pg');
var when = require('when');

var Client = require('./Client');
var ClientProvider = require('./ClientProvider');

module.exports = function() {
    'use strict';

    var PooledClientProvider = ClientProvider.extend({
        init: function(host, database, username, password, port, applicationName) {
            this._super(host, database, username, password, port, applicationName);

            this._preparedStatementMap = { };
        },

        _getClient: function() {
            var that = this;

            return when.promise(function(resolveCallback, rejectCallback) {
                pg.connect(that._getConfiguration(), function(err, pgClient, releaseCallback) {
                    if (err) {
                        rejectCallback(err);
                    } else {
                        resolveCallback(new PooledClient(pgClient, that._preparedStatementMap, releaseCallback));
                    }
                });
            });
        },

        toString: function() {
            return '[PooledClientProvider]';
        }
    });

    var PooledClient = Client.extend({
        init: function(pgClient, statementMap, releaseCallback) {
            this._super(pgClient, statementMap);

            this._releaseCallback = releaseCallback;
        },

        _dispose: function() {
            this._releaseCallback();

            this._pgClient = null;
            this._releaseCallback = null;
        }
    });

    return PooledClientProvider;
}();