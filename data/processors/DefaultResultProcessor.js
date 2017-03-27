const log4js = require('log4js');

const attributes = require('common/lang/attributes'),
	is = require('common/lang/is');

const MutateResultProcessor = require('./MutateResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/DefaultResultProcessor');

	/**
	 * If a property does not exist or is undefined, assigns a default value.
	 *
	 * @public
	 * @extends MutateResultProcessor
	 * @param {Object} configuration
	 * @param {string} configuration.propertyName
	 * @param {Object} configuration.defaultValue
	 */
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