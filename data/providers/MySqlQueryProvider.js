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

			that.connection = mysql.createConnection({
				host: that._configuration.host,
				user: that._configuration.user,
				password: that._configuration.password,
				database: that._configuration.database
			});

			return when.promise(function(resolve, reject) {
				that.connection.query(that._configuration.query, function(err, rows) {
					if (err) {
						reject(err);
					}

					resolve(rows);
				});
			});
		},

		toString: function() {
			return '[MySqlQueryProvider]';
		}
	});

	return MySqlQueryProvider;
}();