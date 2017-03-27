const log4js = require('log4js');

const attributes = require('common/lang/attributes'),
	is = require('common/lang/is');

const ResultProcessor = require('./../ResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/FilterEqualsResultProcessor');

	/**
	 * Filters an array to items based on equality checks against
	 * one (or more) of the item's properties.
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

						let valueToMatch;

						if (is.string(condition.valueRef) && attributes.has(results, condition.valueRef)) {
							valueToMatch = attributes.read(results, condition.valueRef);
						} else {
							valueToMatch = condition.value;
						}

						const match = propertyValue === valueToMatch;
						const inverse = is.boolean(condition.inverse) && condition.inverse;

						return match ^ inverse;
					});
				});
			} else {
				returnRef = [ ];
			}

			return returnRef;
		}

		toString() {
			return '[FilterEqualsResultProcessor]';
		}
	}

	return FilterEqualsResultProcessor;
})();