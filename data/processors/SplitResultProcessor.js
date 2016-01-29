var _ = require('lodash');
var log4js = require('log4js');

var attributes = require('common/lang/attributes');

var MutateResultProcessor = require('./MutateResultProcessor');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('data/processors/SplitResultProcessor');

	var SplitResultProcessor = MutateResultProcessor.extend({
		init: function(configuration) {
			this._super(configuration);
		},

		_processItem: function(resultItemToProcess, configurationToUse) {
			var configuration = this._getConfiguration();

			var propertyName = configurationToUse.propertyName;
			var propertyValue = attributes.read(resultItemToProcess, propertyName);

			if (_.isString(propertyValue)) {
				var splitResult;

				if (_.isString(configurationToUse.separatorString)) {
					splitResult = propertyValue.split(configurationToUse.separatorString);
				} else if (_.isString(configurationToUse.separatorRegex)) {
					splitResult = propertyValue.split(new RegExp(configurationToUse.separatorRegex));
				} else {
					splitResult = propertyValue;
				}

				attributes.write(resultItemToProcess, propertyName, splitResult);
			}

			return resultItemToProcess;
		},

		toString: function() {
			return '[SplitResultProcessor]';
		}
	});

	return SplitResultProcessor;
}();