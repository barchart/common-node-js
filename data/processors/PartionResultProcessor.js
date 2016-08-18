var _ = require('lodash');
var log4js = require('log4js');

var attributes = require('common/lang/attributes');

var ResultProcessor = require('./../ResultProcessor');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('data/processors/PartionResultProcessor');

	var PartionResultProcessor = ResultProcessor.extend({
		init: function(configuration) {
			this._super(configuration);
		},

		_process: function(results) {
			var that = this;

			if (_.isUndefined(results) || _.isNull(results)) {
				return [];
			}

			if (!_.isArray(results)) {
				throw new Error('Unable to partition results, input must be an array.');
			}

			var configuration = that._getConfiguration();

			var partitionSize = configuration.size;

			if (_.isString(partitionSize)) {
				partitionSize = parseInt(partitionSize);
			}

			partitionSize = partitionSize || 10;

			var original = results.slice(0);
			var partitions = [ ];

			while (original.length !== 0) {
				partitions.push(original.splice(0, partitionSize));
			}

			return partitions;
		},

		toString: function() {
			return '[PartionResultProcessor]';
		}
	});

	return PartionResultProcessor;
}();