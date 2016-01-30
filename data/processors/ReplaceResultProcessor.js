var _ = require('lodash');
var log4js = require('log4js');

var attributes = require('common/lang/attributes');

var MutateResultProcessor = require('./MutateResultProcessor');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('data/processors/ReplaceResultProcessor');

	var ReplaceResultProcessor = MutateResultProcessor.extend({
		init: function(configuration) {
			this._super(configuration);
		},

		_processItem: function(resultItemToProcess, configurationToUse) {
			var propertyName = configurationToUse.propertyName;
			var propertyValue = attributes.read(resultItemToProcess, propertyName);

			if (_.isString(propertyValue)) {
				var selectExpression = configurationToUse.selectExpression;
				var replaceExpression = configurationToUse.replaceExpression;

				attributes.write(resultItemToProcess, propertyName, propertyValue.replace(new RegExp(selectExpression, 'g'), replaceExpression));
			}
		},

		toString: function() {
			return '[ReplaceResultProcessor]';
		}
	});

	return ReplaceResultProcessor;
}();