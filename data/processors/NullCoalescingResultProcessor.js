var log4js = require('log4js');

var attributes = require('common/lang/attributes');

var MutateResultProcessor = require('./MutateResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/NullCoalescingResultProcessor');

	class NullCoalescingResultProcessor extends MutateResultProcessor {
		constructor(configuration) {
			super(configuration);
		}

		_processItem(resultItemToProcess, configurationToUse) {
			const propertyName = configurationToUse.propertyName;
			const propertyValue = attributes.read(resultItemToProcess, propertyName);

			if (propertyValue === null) {
				attributes.write(resultItemToProcess, propertyName, configurationToUse.replaceValue);
			}
		}

		toString() {
			return '[NullCoalescingResultProcessor]';
		}
	}

	return NullCoalescingResultProcessor;
})();