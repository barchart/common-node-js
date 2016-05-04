var _ = require('lodash');
var log4js = require('log4js');

var attributes = require('common/lang/attributes');

var MutateResultProcessor = require('./MutateResultProcessor');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('data/processors/UppercaseResultProcessor');

	var UppercaseResultProcessor = MutateResultProcessor.extend({
		init: function(configuration) {
			this._super(configuration);
		},

		_processItem: function(resultItemToProcess, configurationToUse) {
			var propertyName = configurationToUse.propertyName;
			var propertyValue = attributes.read(resultItemToProcess, propertyName);

			if (_.isArray(propertyValue)) {
				var values = _.map(propertyValue, function(item) {
					return item.toUpperCase();
				});

				attributes.write(resultItemToProcess, propertyName, values);
			}

			// if (_.isNumber(propertyValue) && !_.isNaN(propertyValue)) {
			// 	attributes.write(resultItemToProcess, propertyName, (propertyValue + configurationToUse.amount));
			// }
		},

		toString: function() {
			return '[UppercaseResultProcessor]';
		}
	});

	return UppercaseResultProcessor;
}();