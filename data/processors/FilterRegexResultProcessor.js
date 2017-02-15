var log4js = require('log4js');

var attributes = require('common/lang/attributes');
var is = require('common/lang/is');

var ResultProcessor = require('./../ResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/FilterRegexResultProcessor');

	/**
	 * Filters an array to items that have one (or more) properties that
	 * match a regular expression.
	 *
	 * @public
	 * @extends ResultProcessor
	 * @param {object} configuration
	 */
	class FilterRegexResultProcessor extends ResultProcessor {
		constructor(configuration) {
			super(configuration);
		}

		_process(results) {
			const configuration = this._getConfiguration();

			let returnRef;

			if (is.array(results) && is.array(configuration.conditions)) {
				returnRef = results.filter((result) => {
					return configuration.conditions.every((condition) => {
						let returnVal;

						if (is.string(condition.propertyName) && is.string(condition.expression) && attributes.has(result, condition.propertyName)) {
							const expression = new RegExp(condition.expression);

							const match = expression.test(attributes.read(result, condition.propertyName));
							const inverse = is.boolean(condition.inverse) && condition.inverse;

							returnVal = match ^ inverse;
						} else {
							returnVal = false;
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
			return '[FilterRegexResultProcessor]';
		}
	}

	return FilterRegexResultProcessor;
})();