var log4js = require('log4js');

var attributes = require('common/lang/attributes');
var is = require('common/lang/is');

var MutateResultProcessor = require('./MutateResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/DivideResultProcessor');

	/**
	 * Divides two numbers and assigns the result back to the context object.
	 *
	 * @public
	 * @extends MutateResultProcessor
	 * @param {object} configuration
	 * @param {string} configuration.propertyName - The property to which the result will be assigned.
	 * @param {number=} configuration.numerator - If provided, the numerator value.
	 * @param {string=} configuration.numeratorRef - The name of the property that holds the numerator value.
	 * @param {number=} configuration.denominator - If provided, the denominator value.
	 * @param {string=} configuration.denominatorRef - The name of the property that holds the denominator value.
	 */
	class DivideResultProcessor extends MutateResultProcessor {
		constructor(configuration) {
			super(configuration);
		}

		_processItem(resultItemToProcess, configurationToUse) {
			const propertyName = configurationToUse.propertyName;

			if (!is.string(propertyName)) {
				return;
			}

			let numerator;

			if (is.number(configurationToUse.numerator)) {
				numerator = configurationToUse.numerator;
			} else if (is.string(configurationToUse.numeratorRef)) {
				numerator = parseFloat(attributes.read(resultItemToProcess, configurationToUse.numeratorRef));
			} else {
				numerator = null;
			}

			let denominator;

			if (is.number(configurationToUse.denominator)) {
				denominator = configurationToUse.denominator;
			} else if (is.string(configurationToUse.denominatorRef)) {
				denominator = parseFloat(attributes.read(resultItemToProcess, configurationToUse.denominatorRef));
			} else {
				denominator = null;
			}

			if (is.number(numerator) && is.number(denominator) && denominator !== 0) {
				attributes.write(resultItemToProcess, propertyName, numerator / denominator);
			}
		}

		toString() {
			return '[DivideResultProcessor]';
		}
	}

	return DivideResultProcessor;
})();