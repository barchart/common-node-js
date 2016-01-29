var _ = require('lodash');
var Class = require('class.extend');
var log4js = require('log4js');

var assert = require('common/lang/assert');

var QueryProvider = require('./QueryProvider');
var ResultProcessor = require('./ResultProcessor');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('data/DataProvider');

	var DataProvider = Class.extend({
		init: function(queryProvider, resultProcessor) {
			assert.argumentIsRequired(queryProvider, 'queryProvider', QueryProvider, 'QueryProvider');
			assert.argumentIsRequired(resultProcessor, 'resultProcessor', ResultProcessor, 'ResultProcessor');

			this._queryProvider = queryProvider;
			this._resultProcessor = resultProcessor;
		},

		getData: function(criteria) {
			var that = this;

			return that._queryProvider.runQuery(criteria)
				.then(function(data) {
					return that._resultProcessor.process(data);
				});
		},

		getCriteriaIsValid: function(criteria) {
			return this._queryProvider.getCriteriaIsValid(criteria);
		},

		toString: function() {
			var resultProcessorString;

			if (this._resultProcessor) {
				resultProcessorString = this._resultProcessor.toString();
			} else {
				resultProcessorString = '[none]';
			}

			return '[DataProvider (QueryProvider=' + this._queryProvider.toString() + ', ResultProcessor=' + resultProcessorString + ')]';
		}
	});

	return DataProvider;
}();