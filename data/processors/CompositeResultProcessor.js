var _ = require('lodash');
var log4js = require('log4js');
var pipeline = require('when/pipeline');

var ResultProcessor = require('./../ResultProcessor');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('data/processors/CompositeResultProcessor');

	var CompositeResultProcessor = ResultProcessor.extend({
		init: function(resultProcessors) {
			this._super(null);

			this._resultProcessors = resultProcessors;
		},

		_process: function(results) {
			var that = this;

			var functions = _.map(that._resultProcessors, function(resultProcessor) {
				return ResultProcessor.toFunction(resultProcessor);
			});

			return pipeline(functions, results);
		},

		toString: function() {
			return '[CompositeResultProcessor]';
		}
	});

	return CompositeResultProcessor;
}();