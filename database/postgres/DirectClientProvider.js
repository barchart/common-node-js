var Class = require('class.extend');
var log4js = require('log4js');
var pg = require('pg');
var when = require('when');

var Client = require('./Client');
var ClientProvider = require('./ClientProvider');

module.exports = function() {
    'use strict';

	var logger = log4js.getLogger('common-node/database/postgres/DirectClientProvider');

    var DirectClientProvider = ClientProvider.extend({
        init: function(host, database, username, password, port, applicationName) {
            this._super(host, database, username, password, port, applicationName);
        },

        _getClient: function() {
            var that = this;

			logger.debug('Creating new connection.');

            return when.promise(function(resolveCallback, rejectCallback) {
                var pgClient = new pg.Client(that._getConfiguration());

                pgClient.connect(function(err) {
                    if (err) {
                        rejectCallback(err);
                    } else {
						logger.debug('Connection created.');

                        resolveCallback(new DirectClient(pgClient));
                    }
                });
            });
        },

        _onDispose: function() {
            pg.end();
        },

        toString: function() {
            return '[DirectClientProvider]';
        }
    });

    var DirectClient = Client.extend({
        init: function(pgClient) {
            this._super(pgClient, { });
        },

		_onDispose: function() {
            this._pgClient.end();
            this._pgClient = null;

			logger.debug('Connection disposed');
        }
    });

    return DirectClientProvider;
}();