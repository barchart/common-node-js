var _ = require('lodash');
var when = require('when');

var Disposable = require('common/lang/Disposable');

module.exports = function() {
    'use strict';

    var Client = Disposable.extend({
        init: function(pgClient, preparedStatementMap) {
            this._pgClient = pgClient;

            this._preparedStatementMap = preparedStatementMap;
        },

        query: function(query, parameters, name) {
            var that = this;

            return when.promise(function(resolveCallback, rejectCallback) {
                var queryObject = {
                    values: parameters || [ ]
                };

                if (_.isString(name)) {
                    queryObject.name = name;

                    if (!_.has(that._preparedStatementMap, name)) {
                        queryObject.text = query;

                        that._preparedStatementMap[name] = query;
                    }
                } else {
                    queryObject.text = query;
                }

                that._pgClient.query(queryObject, function(err, result) {
                    if (err) {
                        rejectCallback(err);
                    } else {
                        resolveCallback(result);
                    }
                });
            });
        },

        toString: function() {
            return '[Client]';
        }
    });

    return Client;
}();