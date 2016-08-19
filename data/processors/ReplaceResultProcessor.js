var log4js = require('log4js');

var attributes = require('common/lang/attributes');
var is = require('common/lang/is');

var MutateResultProcessor = require('./MutateResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/ReplaceResultProcessor');

	class ReplaceResultProcessor extends MutateResultProcessor {
		constructor(configuration) {
			super(configuration);
		}

		_processItem(resultItemToProcess, configurationToUse) {
			const propertyName = configurationToUse.propertyName;
			const propertyValue = attributes.read(resultItemToProcess, propertyName);

			if (is.string(propertyValue)) {
				const selectExpression = configurationToUse.selectExpression;
				const replaceExpression = configurationToUse.replaceExpression;

				attributes.write(resultItemToProcess, propertyName, propertyValue.replace(new RegExp(selectExpression, 'g'), replaceExpression));
			}
		}

		toString() {
			return '[ReplaceResultProcessor]';
		}
	}

	return ReplaceResultProcessor;
})();