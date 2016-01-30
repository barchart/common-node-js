var _ = require('lodash');
var log4js = require('log4js');
var when = require('when');

var assert = require('common/lang/assert');
var Disposable = require('common/lang/Disposable');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('common-node/database/postgres/Client');

	var Client = Disposable.extend({
		init: function(pgClient, preparedStatementMap) {
			assert.argumentIsRequired(pgClient, 'pgClient');
			assert.argumentIsRequired(preparedStatementMap, 'preparedStatementMap');

			this._super();

			this._pgClient = pgClient;

			this._preparedStatementMap = preparedStatementMap;
		},

		query: function(query, parameters, name) {
			assert.argumentIsRequired(query, 'query', String);
			assert.argumentIsOptional(name, 'name', String);

			var that = this;

			return when.promise(function(resolveCallback, rejectCallback) {
				var queryObject = {
					values: parameters || []
				};

				if (_.isString(name)) {
					queryObject.name = name;

					if (!_.has(that._preparedStatementMap, name)) {
						that._preparedStatementMap[name] = query;

					}

					queryObject.text = that._preparedStatementMap[name];
				} else {
					queryObject.text = query;
				}

				queryCounter = queryCounter + 1;

				var queryCount = queryCounter;

				logger.debug('Executing query', queryCount);
				logger.trace('Executing query', queryCount, 'with:', queryObject);

				that._pgClient.query(queryObject, function(err, result) {
					if (err) {
						logger.debug('Query', queryCount, 'failed');

						rejectCallback(err);
					} else {
						logger.debug('Query', queryCount, 'finished');

						resolveCallback(result);
					}
				});
			});
		},

		toString: function() {
			return '[Client]';
		}
	});

	var queryCounter = 0;

	return Client;
}();