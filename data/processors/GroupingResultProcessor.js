var _ = require('lodash');
var log4js = require('log4js');

var attributes = require('common/lang/attributes');

var MutateResultProcessor = require('./MutateResultProcessor');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('data/processors/GroupingResultProcessor');

	var GroupingResultProcessor = MutateResultProcessor.extend({
		init: function(configuration) {
			this._super(configuration);
		},

		_processItem: function(resultItemToProcess, configurationToUse) {
			if (!(_.isString(configurationToUse.sourcePropertyName) && attributes.has(resultItemToProcess, configurationToUse.sourcePropertyName) && _.isString(configurationToUse.groupPropertyName))) {
				return;
			}

			var sourcePropertyName = configurationToUse.sourcePropertyName;
			var groupPropertyName = configurationToUse.groupPropertyName;

			var source = attributes.read(resultItemToProcess, sourcePropertyName);
			var groups;

			if (_.isArray(source)) {
				groups = _.groupBy(source, function(sourceItem) {
					return attributes.read(sourceItem, groupPropertyName);
				});
			} else {
				groups = null;
			}

			var targetPropertyName;

			if (_.isString(configurationToUse.targetPropertyName)) {
				targetPropertyName = configurationToUse.targetPropertyName;
			} else {
				targetPropertyName = sourcePropertyName;
			}

			attributes.write(resultItemToProcess, targetPropertyName, groups);
		},

		toString: function() {
			return '[GroupingResultProcessor]';
		}
	});

	return GroupingResultProcessor;
}();