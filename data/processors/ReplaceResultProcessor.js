var log4js = require('log4js');

var attributes = require('common/lang/attributes');
var is = require('common/lang/is');

var MutateResultProcessor = require('./MutateResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/ReplaceResultProcessor');

	/**
	 * Applies regular-expression based replacement to a single property and
	 * overwrites the property.
	 *
	 * @public
	 * @extends MutateResultProcessor
	 * @param {object} configuration
	 * @param {string} configuration.propertyName - Name of the property to apply the regular expression replacement to.
	 * @param {string} configuration.selectExpression - The expression that defines the string to be replaced.
	 * @param {string} configuration.replaceExpression - The expression that defines the replacement string.
	 */
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