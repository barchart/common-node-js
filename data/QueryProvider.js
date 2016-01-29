var Class = require('class.extend');
var log4js = require('log4js');
var when  = require('when');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('data/QueryProvider');

	var QueryProvider = Class.extend({
		init: function(configuration) {
			this._configuration = configuration || { };
		},

		_getConfiguration: function() {
			return this._configuration;
		},

		runQuery: function(criteria) {
			if (!this.getCriteriaIsValid(criteria)) {
				throw new Error('Unable to run query, the query parameters are invalid.');
			}

			var that = this;

			return when.try(function() {
				return that._runQuery(criteria);
			});
		},

		_runQuery: function(criteria) {
			return null;
		},

		getCriteriaIsValid: function(criteria) {
			return this._getCriteriaIsValid(criteria);
		},

		_getCriteriaIsValid: function(criteria) {
			return true;
		},

		toString: function() {
			return '[QueryProvider]';
		}
	});

	return QueryProvider;
}();