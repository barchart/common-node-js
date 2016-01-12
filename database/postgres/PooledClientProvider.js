var Class = require('class.extend');
var log4js = require('log4js');
var pg = require('pg');
var when = require('when');

var Client = require('./Client');
var ClientProvider = require('./ClientProvider');

module.exports = function() {
    'use strict';

	var logger = log4js.getLogger('common-node/database/postgres/PooledClientProvider');

    var PooledClientProvider = ClientProvider.extend({
        init: function(host, database, username, password, port, applicationName) {
            this._super(host, database, username, password, port, applicationName);

            this._preparedStatementMap = { };
        },

        _getClient: function() {
            var that = this;

			logger.debug('Retrieving client from connection pool.');

            return when.promise(function(resolveCallback, rejectCallback) {
                pg.connect(that._getConfiguration(), function(err, pgClient, releaseCallback) {
                    if (err) {
                        rejectCallback(err);
                    } else {
						logger.debug('Retrieved client from connection pool.');

                        resolveCallback(new PooledClient(pgClient, that._preparedStatementMap, releaseCallback));
                    }
                });
            });
        },

		_onDispose: function() {
			pg.end();
		},

        toString: function() {
            return '[PooledClientProvider]';
        }
    });

    var PooledClient = Client.extend({
        init: function(pgClient, preparedStatementMap, releaseCallback) {
            this._super(pgClient, preparedStatementMap);

            this._releaseCallback = releaseCallback;
        },

		_onDispose: function() {
			this._releaseCallback();

            this._pgClient = null;
            this._releaseCallback = null;

			logger.debug('Returned client to connection pool.');
        }
    });

    return PooledClientProvider;
}();