var log4js = require('log4js');
var moment = require('moment');

var attributes = require('common/lang/attributes');
var is = require('common/lang/is');

var ResultProcessor = require('./../ResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/FilterContainsResultProcessor');

	/**
	 * Filters an array. Each included item will have an array with at least one
	 * item that matches a desired value.
	 *
	 * @public
	 * @interface
	 * @extends ResultProcessor
	 * @param {object} configuration
	 * @param {string} configuration.sourcePropertyName - The property name of the array to filter.
	 * @param {string} configuration.matchPropertyName - The property name of the value to match within the "matches" array.
	 * @param {string} configuration.matchTargetsPropertyName - The property name of the array on each "source" item.
	 */
	class FilterContainsResultProcessor extends ResultProcessor {
		constructor(configuration) {
			super(configuration);
		}

		_process(results) {
			const configuration = this._getConfiguration();

			const sourcePropertyName = configuration.sourcePropertyName;
			const matchPropertyName = configuration.matchPropertyName;
			const matchTargetsPropertyName = configuration.matchTargetsPropertyName;

			const source = attributes.read(results, sourcePropertyName);

			let returnRef;

			if (is.array(source) && attributes.has(results, matchPropertyName)) {
				const valueToMatch = attributes.read(results, matchPropertyName);

				returnRef = source.filter((item) => {
					const matchTargets = attributes.read(item, matchTargetsPropertyName);
					
					return is.array(matchTargets) && matchTargets.some(value => value === valueToMatch);
				});
			} else {
				returnRef = [ ];
			}

			return returnRef;
		}

		toString() {
			return '[FilterContainsResultProcessor]';
		}
	}

	return FilterContainsResultProcessor;
})();