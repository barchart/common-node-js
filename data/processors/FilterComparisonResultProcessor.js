const log4js = require('log4js');

const attributes = require('common/lang/attributes'),
	is = require('common/lang/is');

const ResultProcessor = require('./../ResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/FilterComparisonResultProcessor');

	/**
	 * Filters an array to items based on numeric comparisons.
	 *
	 * @public
	 * @extends ResultProcessor
	 * @param {object} configuration
	 * @param {string} configuration.propertyName - The name of a property on the left-hand side of the comparison. If the property value is not numeric, the item is filtered.
	 * @param {string=} configuration.valueRef - The name of the property on the right-hand side of the comparison If the property value is not numeric, the item is filtered.
	 * @param {number=} configuration.value - The numeric value to use on the right-hand side of the comparison.
	 * @param {boolean=} configuration.greater - When true, the "greater than" operation is used for comparison.
	 * @param {boolean=} configuration.less - When true, the "less than" operation is used for comparison.
	 * @param {boolean=} configuration.inverse - When true, operation is reverse (i.e. the inverse of "greater than" is "less than or equal to")
	 */
	class FilterComparisonResultProcessor extends ResultProcessor {
		constructor(configuration) {
			super(configuration);
		}

		_process(results) {
			const configuration = this._getConfiguration();

			let returnRef;

			if (is.array(configuration.conditions)) {
				let source;

				if (is.array(results)) {
					source = results;
				} else if (is.string(configuration.sourceRef)) {
					source = attributes.read(results, configuration.sourceRef);
				} else {
					source = [ ];
				}

				returnRef = source.filter((result) => {
					return configuration.conditions.every((condition) => {
						const propertyValue = attributes.read(result, condition.propertyName);

						let valueToCompare;

						if (is.string(condition.valueRef) && attributes.has(results, condition.valueRef)) {
							valueToCompare = attributes.read(results, condition.valueRef);
						} else {
							valueToCompare = condition.value;
						}

						let predicate;

						const inverse = is.boolean(condition.inverse) && condition.inverse;

						if (is.boolean(condition.greater) && condition.greater) {
							predicate = (a, b) => (a > b) ^ inverse;
						} else if (is.boolean(condition.less) && condition.less) {
							predicate = (a, b) => (a < b) ^ inverse;
						} else {
							predicate = (a, b) => false;
						}

						return is.number(propertyValue) && is.number(valueToCompare) && predicate(propertyValue, valueToCompare);
					});
				});
			} else {
				returnRef = [ ];
			}

			return returnRef;
		}

		toString() {
			return '[FilterComparisonResultProcessor]';
		}
	}

	return FilterComparisonResultProcessor;
})();