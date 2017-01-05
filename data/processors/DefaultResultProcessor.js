var log4js = require('log4js');

var attributes = require('common/lang/attributes');
var is = require('common/lang/is');

var MutateResultProcessor = require('./MutateResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/DefaultResultProcessor');

	/**
	 * Mutates an object, setting a property to a default value, if
	 * the property does not exist or if the property's value is
	 * undefined.
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