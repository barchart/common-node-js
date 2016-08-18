var _ = require('lodash');
var log4js = require('log4js');

var attributes = require('common/lang/attributes');

var ResultProcessor = require('./../ResultProcessor');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('data/processors/AggregateResultProcessor');

	var AggregateResultProcessor = ResultProcessor.extend({
		init: function(configuration) {
			this._super(configuration);
		},

		_process: function(results) {
			var that = this;

			if (_.isUndefined(results) || _.isNull(results)) {
				return [];
			}

			if (!_.isArray(results)) {
				throw new Error('Unable to aggregate results, input must be an array.');
			}

			var aggregate = [ ];

			return aggregate.concat.apply(aggregate, results);
		},

		toString: function() {
			return '[AggregateResultProcessor]';
		}
	});

	return AggregateResultProcessor;
}();