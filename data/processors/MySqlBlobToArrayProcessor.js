var _ = require('lodash');
var log4js = require('log4js');

var attributes = require('common/lang/attributes');

var MutateResultProcessor = require('./MutateResultProcessor');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('data/processors/MySqlBlobToArrayProcessor');

	var MySqlBlobToArrayProcessor = MutateResultProcessor.extend({
		init: function(configuration) {
			this._super(configuration);
		},

		_processItem: function(resultItemToProcess, configurationToUse) {
			var propertyName = configurationToUse.propertyName;
			var propertyValue = attributes.read(resultItemToProcess, propertyName);

			if (logger.isTraceEnabled()) {
				logger.trace('binary object:', propertyValue);
			}

			propertyValue = propertyValue.toString().split(',');

			if (logger.isTraceEnabled()) {
				logger.trace('array:', propertyValue);
			}

			attributes.write(resultItemToProcess, propertyName, propertyValue);
		},

		toString: function() {
			return '[MySqlBlobToArrayProcessor]';
		}
	});

	return MySqlBlobToArrayProcessor;
}();