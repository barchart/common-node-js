var log4js = require('log4js');

var attributes = require('common/lang/attributes');
var is = require('common/lang/is');

var MutateResultProcessor = require('./MutateResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/DefaultResultProcessor');

	class DefaultResultProcessor extends MutateResultProcessor {
		constructor(configuration) {
			super(configuration);
		}

		_processItem(resultItemToProcess, configurationToUse) {
			const propertyName = configurationToUse.propertyName;
			const propertyValue = attributes.read(resultItemToProcess, propertyName);

			if (is.undefined(propertyValue)) {
				attributes.write(resultItemToProcess, propertyName, configurationToUse.defaultValue);
			}
		}

		toString() {
			return '[DefaultResultProcessor]';
		}
	}

	return DefaultResultProcessor;
})();