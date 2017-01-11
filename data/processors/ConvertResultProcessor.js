var log4js = require('log4js');

var attributes = require('common/lang/attributes');
var is = require('common/lang/is');

var MutateResultProcessor = require('./MutateResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/ConvertResultProcessor');

	/**
	 * Converts a property's value to another type.
	 *
	 * @public
	 * @extends MutateResultProcessor
	 * @param {object} configuration
	 * @param {string} configuration.propertyName - Name of property to convert.
	 * @param {string} configuration.propertyType - Desired type. Valid options are: "string"
	 */
	class ConvertResultProcessor extends MutateResultProcessor {
		constructor(configuration) {
			super(configuration);
		}

		_processItem(resultItemToProcess, configurationToUse) {
			const propertyName = configurationToUse.propertyName;

			if (attributes.has(resultItemToProcess, propertyName)) {
				let propertyValue = attributes.read(resultItemToProcess, propertyName);
				let propertyType = configurationToUse.propertyType;

				if (propertyType.toUpperCase() === 'STRING') {
					if (is.null(propertyValue)) {
						propertyType = 'null';
					} else if (is.undefined(propertyValue)) {
						propertyType = 'undefined';
					} else {
						propertyType = propertyValue.toString();
					}
				}

				attributes.write(resultItemToProcess, propertyName, propertyType);
			}
		}

		toString() {
			return '[ConvertResultProcessor]';
		}
	}

	return ConvertResultProcessor;
})();