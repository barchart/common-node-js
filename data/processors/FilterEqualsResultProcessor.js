var log4js = require('log4js');

var attributes = require('common/lang/attributes');
var is = require('common/lang/is');

var ResultProcessor = require('./../ResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/FilterEqualsResultProcessor');

	/**
	 * Filters an array to items that have one (or more) properties that
	 * match a configured value.
	 *
	 * @public
	 * @extends ResultProcessor
	 * @param {object} configuration
	 */
	class FilterEqualsResultProcessor extends ResultProcessor {
		constructor(configuration) {
			super(configuration);
		}

		_process(results) {
			const configuration = this._getConfiguration();

			let returnRef;

			if (is.array(results) && is.array(configuration.conditions)) {
				returnRef = results.filter((result) => {
					return configuration.conditions.every((condition) => {
						const propertyValue = attributes.read(result, condition.propertyName);

						let valueToMatch;

						if (is.string(condition.valueRef) && attributes.has(result, condition.valueRef)) {
							valueToMatch = attributes.read(result, condition.valueRef);
						} else {
							valueToMatch = condition.value;
						}

						let returnVal;

						if (is.boolean(condition.inverse) && condition.inverse) {
							returnVal = propertyValue !== valueToMatch;
						} else {
							returnVal = propertyValue === valueToMatch;
						}

						return returnVal;
					});
				});
			} else {
				returnRef = results;
			}

			return returnRef;
		}

		toString() {
			return '[FilterEqualsResultProcessor]';
		}
	}

	return FilterEqualsResultProcessor;
})();