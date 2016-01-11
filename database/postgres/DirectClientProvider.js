var Class = require('class.extend');
var pg = require('pg');
var when = require('when');

var Client = require('./Client');
var ClientProvider = require('./ClientProvider');

module.exports = function() {
    'use strict';

    var DirectClientProvider = ClientProvider.extend({
        init: function(host, database, username, password, port, applicationName) {
            this._super(host, database, username, password, port, applicationName);
        },

        _getClient: function() {
            var that = this;

            return when.promise(function(resolveCallback, rejectCallback) {
                var pgClient = new pg.Client(that._getConfiguration());

                pgClient.connect(function(err) {
                    if (err) {
                        rejectCallback(err);
                    } else {
                        resolveCallback(new Client(pgClient));
                    }
                });
            });
        },

        toString: function() {
            return '[DirectClientProvider]';
        }
    });

    var DirectClient = Client.extend({
        init: function(pgClient) {
            this._super(pgClient, { });
        },

        _dispose: function() {
            this._pgClient.end();
            this._pgClient = null;
        }
    });

    return DirectClientProvider;
}();