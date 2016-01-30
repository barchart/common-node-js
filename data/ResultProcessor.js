var Class = require('class.extend');
var log4js = require('log4js');
var when = require('when');

var assert = require('common/lang/assert');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('data/ResultProcessor');

	var ResultProcessor = Class.extend({
		init: function(configuration) {
			this._configuration = configuration || {};
		},

		_getConfiguration: function() {
			return this._configuration;
		},

		process: function(results) {
			var that = this;

			return when.try(function() {
				return that._process(results);
			});
		},

		_process: function(results) {
			return results;
		},

		toString: function() {
			return '[ResultProcessor]';
		}
	});

	ResultProcessor.toFunction = function(resultProcessor) {
		assert.argumentIsRequired(resultProcessor, 'resultProcessor', ResultProcessor, 'ResultProcessor');

		return function(results) {
			return resultProcessor.process(results);
		};
	};

	return ResultProcessor;
}();