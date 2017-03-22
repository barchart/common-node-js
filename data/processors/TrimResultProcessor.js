var log4js = require('log4js');

var attributes = require('common/lang/attributes');
var is = require('common/lang/is');

var MutateResultProcessor = require('./MutateResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/TrimResultProcessor');

	/**
	 * Trims a string (or an array of strings). If the value (or array item) is
	 * not a string, the value is ignored.
	 *
	 * @public
	 * @extends MutateResultProcessor
	 * @param {object} configuration
	 * @param {string} configuration.propertyName - The property to trim.
	 */
	class TrimResultProcessor extends MutateResultProcessor {
		constructor(configuration) {
			super(configuration);
		}

		_processItem(resultItemToProcess, configurationToUse) {
			const propertyName = configurationToUse.propertyName;

			if (attributes.has(resultItemToProcess, propertyName)) {
				const propertyValue = attributes.read(resultItemToProcess, propertyName);

				let convertedValue;

				if (is.array(propertyValue)) {
					convertedValue = propertyValue.map(trim);
				} else {
					convertedValue = trim(propertyValue);
				}

				attributes.write(resultItemToProcess, propertyName, convertedValue);
			}
		}

		toString() {
			return '[TrimResultProcessor]';
		}
	}

	function trim(target) {
		let returnRef;

		if (is.string(target)) {
			returnRef = target.trim();
		} else {
			returnRef = target;
		}

		return returnRef;
	}

	return TrimResultProcessor;
})();