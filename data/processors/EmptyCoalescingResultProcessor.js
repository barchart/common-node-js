var _ = require('lodash');
var log4js = require('log4js');

var attributes = require('common/lang/attributes');

var MutateResultProcessor = require('./MutateResultProcessor');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('data/processors/EmptyCoalescingResultProcessor');

	var EmptyCoalescingResultProcessor = MutateResultProcessor.extend({
		init: function(configuration) {
			this._super(configuration);
		},

		_processItem: function(resultItemToProcess, configurationToUse) {
			var propertyName = configurationToUse.propertyName;

			var replace;

			if (attributes.has(resultItemToProcess, propertyName)) {
				var propertyValue = attributes.read(resultItemToProcess, propertyName);

				replace = _.isNull(propertyValue) || _.isUndefined(propertyValue) || propertyValue === '';
			} else {
				replace = true;
			}

			if (replace) {
				attributes.write(resultItemToProcess, propertyName, configurationToUse.replaceValue);
			}
		},

		toString: function() {
			return '[EmptyCoalescingResultProcessor]';
		}
	});

	return EmptyCoalescingResultProcessor;
}();