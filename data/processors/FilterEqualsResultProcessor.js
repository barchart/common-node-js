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
	 * @param {object} configuration.conditions - An object of key/value pairs where the key is the name of the property to match and the value is the expected value.
	 * @param {boolean=} configuration.inverse - If true, matches are excluded (instead of included) from the results.
	 */
	class FilterEqualsResultProcessor extends ResultProcessor {
		constructor(configuration) {
			super(configuration);
		}

		_process(results) {
			const configuration = this._getConfiguration();

			let returnRef;

			if (is.array(results) && is.object(configuration.conditions)) {
				const conditions = configuration.conditions;
				const properties = Object.keys(configuration.conditions);

				let predicate;

				if (is.boolean(configuration.inverse) && configuration.inverse) {
					predicate = (a, b) => a !== b;
				} else {
					predicate = (a, b) => a === b;
				}

				returnRef = results.filter((result) => {
					return properties.every((propertyName) => {
						const expectedValue = conditions[propertyName];

						return attributes.has(result, propertyName) && predicate(attributes.read(result, propertyName), expectedValue);
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