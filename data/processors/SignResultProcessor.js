var _ = require('lodash');
var log4js = require('log4js');

var attributes = require('common/lang/attributes');

var MutateResultProcessor = require('./MutateResultProcessor');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('data/processors/SignResultProcessor');

	var SignResultProcessor = MutateResultProcessor.extend({
		init: function(configuration) {
			this._super(configuration);
		},

		_processItem: function(resultItemToProcess, configurationToUse) {
			var propertyValue = attributes.read(resultItemToProcess, configurationToUse.sourcePropertyName);

			if (_.isString(propertyValue)) {
				propertyValue = parseFloat(propertyValue);
			}

			if (_.isNumber(propertyValue) && !_.isNaN(propertyValue)) {
				var signValue;

				if (propertyValue === 0) {
					signValue = configurationToUse.targetPropertyValue.zero;
				} else if (propertyValue > 0) {
					signValue = configurationToUse.targetPropertyValue.positive;
				} else if (propertyValue < 0) {
					signValue = configurationToUse.targetPropertyValue.negative;
				}

				attributes.write(resultItemToProcess, configurationToUse.targetPropertyName, signValue);
			}
		},

		toString: function() {
			return '[SignResultProcessor]';
		}
	});

	return SignResultProcessor;
}();