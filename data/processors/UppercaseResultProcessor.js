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

			var convertedValue;

			if (_.isArray(propertyValue)) {
				convertedValue = _.map(propertyValue, convertToUppercase);
			} else {
				convertedValue = convertToUppercase(propertyValue);
			}

			attributes.write(resultItemToProcess, propertyName, convertedValue);
		},

		toString: function() {
			return '[UppercaseResultProcessor]';
		}
	});

	function convertToUppercase(target) {
		var returnRef;

		if (_.isString(target)) {
			returnRef = target.toUpperCase();
		} else {
			returnRef = target;
		}

		return returnRef;
	}

	return UppercaseResultProcessor;
}();