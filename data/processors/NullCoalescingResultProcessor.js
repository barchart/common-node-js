var _ = require('lodash');
var log4js = require('log4js');

var attributes = require('common/lang/attributes');

var MutateResultProcessor = require('./MutateResultProcessor');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('data/processors/NullCoalescingResultProcessor');

	var NullCoalescingResultProcessor = MutateResultProcessor.extend({
		init: function(configuration) {
			this._super(configuration);
		},

		_processItem: function(resultItemToProcess, configurationToUse) {
			var propertyName = configurationToUse.propertyName;
			var propertyValue = attributes.read(resultItemToProcess, propertyName);

			if (propertyValue === null) {
				attributes.write(resultItemToProcess, propertyName, configurationToUse.replaceValue);
			}
		},

		toString: function() {
			return '[NullCoalescingResultProcessor]';
		}
	});

	return NullCoalescingResultProcessor;
}();