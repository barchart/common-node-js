var _ = require('lodash');
var log4js = require('log4js');

var attributes = require('common/lang/attributes');

var MutateResultProcessor = require('./MutateResultProcessor');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('data/processors/CountResultProcessor');

	var CountResultProcessor = MutateResultProcessor.extend({
		init: function(configuration) {
			this._super(configuration);
		},

		_processItem: function(resultItemToProcess, configurationToUse) {
			if (!_.isString(configurationToUse.sourcePropertyName) || !_.isString(configurationToUse.sourcePropertyName) || !attributes.has(resultItemToProcess, configurationToUse.sourcePropertyName)) {
				return;
			}

			var equalsPredicate;

			if (_.isObject(configurationToUse.criteria) && _.isObject(configurationToUse.criteria.equals)) {
				equalsPredicate = function(item) {
					return _.every(configurationToUse.criteria.equals, function(expectedValue, propertyName) {
						return attributes.has(item, propertyName) && attributes.read(item, propertyName) === expectedValue;
					});
				};
			} else {
				equalsPredicate = function(item) {
					return true;
				};
			}

			var objectToCount = attributes.read(resultItemToProcess, configurationToUse.sourcePropertyName);

			var count = _.reduce(objectToCount, function(current, item) {
				var returnVal;

				if (equalsPredicate(item)) {
					returnVal = current + 1;
				} else {
					returnVal = current;
				}

				return returnVal;
			}, 0);

			var targetPropertyName;

			if (_.isString(configurationToUse.targetPropertyName)) {
				targetPropertyName = configurationToUse.targetPropertyName;
			} else {
				targetPropertyName = configurationToUse.sourcePropertyName;
			}

			attributes.write(resultItemToProcess, targetPropertyName, count);
		},

		toString: function() {
			return '[CountResultProcessor]';
		}
	});

	return CountResultProcessor;
}();