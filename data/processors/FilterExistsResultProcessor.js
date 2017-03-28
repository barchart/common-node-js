const log4js = require('log4js');

const attributes = require('common/lang/attributes'),
	is = require('common/lang/is');

const ResultProcessor = require('./../ResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/FilterExistsResultProcessor');

	/**
	 * Filters an array to items where a specific property exists (or
	 * does not exist).
	 *
	 * @public
	 * @extends ResultProcessor
	 * @param {object} configuration
	 * @param {object} configuration
	 */
	class FilterExistsResultProcessor extends ResultProcessor {
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
						const exists = attributes.has(result, condition.propertyName);
						const inverse = is.boolean(condition.inverse) && condition.inverse;

						return exists ^ inverse;
					});
				});
			} else {
				returnRef = [ ];
			}

			return returnRef;
		}

		toString() {
			return '[FilterExistsResultProcessor]';
		}
	}

	return FilterExistsResultProcessor;
})();