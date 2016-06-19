var _ = require('lodash');
var mysql = require('mysql');
var log4js = require('log4js');
var when = require('when');

var QueryProvider = require('./../QueryProvider');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('data/providers/MySqlQueryProvider');

	var MySqlQueryProvider = QueryProvider.extend({
		init: function(configuration) {
			this._super(configuration);
		},

		_runQuery: function(criteria) {
			var that = this;

			var connection = mysql.createConnection({
				host: that._configuration.host,
				user: that._configuration.user,
				password: that._configuration.password,
				database: that._configuration.database
			});

			var canEnd = true;

			connection.on('error', function(e) {
				canEnd = false;

				logger.error('MySql connection error (fatal)', e);
			});

			return when.promise(function(resolve, reject) {
				connection.query(that._configuration.query, function(e, rows) {
					if (e) {
						logger.error('MySql query error', e);

						reject(e);
					}

					resolve(rows);
				})
			}).finally(function() {
				if (canEnd) {
					connection.end(function(endError) {
						logger.error('MySql connection error (on close)', endError);
					});
				}
			});
		},

		toString: function() {
			return '[MySqlQueryProvider]';
		}
	});

	return MySqlQueryProvider;
}();