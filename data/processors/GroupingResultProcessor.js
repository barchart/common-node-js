var log4js = require('log4js');

var array = require('common/lang/array');
var attributes = require('common/lang/attributes');
var is = require('common/lang/is');

var MutateResultProcessor = require('./MutateResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/GroupingResultProcessor');

	class GroupingResultProcessor extends MutateResultProcessor {
		constructor(configuration) {
			super(configuration);
		}

		_processItem(resultItemToProcess, configurationToUse) {
			if (!(is.string(configurationToUse.sourcePropertyName) && attributes.has(resultItemToProcess, configurationToUse.sourcePropertyName) && is.string(configurationToUse.groupPropertyName))) {
				return;
			}

			const sourcePropertyName = configurationToUse.sourcePropertyName;
			const groupPropertyName = configurationToUse.groupPropertyName;

			let source = attributes.read(resultItemToProcess, sourcePropertyName);
			let groups;

			if (is.array(source)) {
				groups = array.groupBy(source, (sourceItem) => {
					return attributes.read(sourceItem, groupPropertyName);
				});
			} else {
				groups = null;
			}

			let targetPropertyName;

			if (is.string(configurationToUse.targetPropertyName)) {
				targetPropertyName = configurationToUse.targetPropertyName;
			} else {
				targetPropertyName = sourcePropertyName;
			}

			attributes.write(resultItemToProcess, targetPropertyName, groups);
		}

		toString() {
			return '[GroupingResultProcessor]';
		}
	}

	return GroupingResultProcessor;
})();