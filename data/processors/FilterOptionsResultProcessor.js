const log4js = require('log4js'),
	moment = require('moment');

const attributes = require('common/lang/attributes'),
	is = require('common/lang/is');

const ResultProcessor = require('./../ResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/FilterOptionsResultProcessor');

	/**
	 * Filters an array to items which have a property value that is contained
	 * within a another array.
	 *
	 * @public
	 * @extends ResultProcessor
	 * @param {object} configuration
	 */
	class FilterOptionsResultProcessor extends ResultProcessor {
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
						let options;

						if (is.string(condition.optionsRef)) {
							options = attributes.read(results, condition.optionsRef);
						} else if (is.array(condition.options)) {
							options = condition.options;
						}

						if (!is.array(options)) {
							options = [ ];
						}

						const propertyValue = attributes.read(result, condition.propertyName);

						const match = options.some(option => propertyValue === option);
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
			return '[FilterOptionsResultProcessor]';
		}
	}

	return FilterOptionsResultProcessor;
})();