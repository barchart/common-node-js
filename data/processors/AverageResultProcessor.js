var log4js = require('log4js');

var attributes = require('common/lang/attributes');
var is = require('common/lang/is');

var ResultProcessor = require('./../ResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/AverageResultProcessor');

	const extractOne = item => 1;

	/**
	 * Sums an array.
	 *
	 * @public
	 * @extends ResultProcessor
	 * @param {object} configuration
	 * @param {string=} configuration.propertyName - If the array contains objects, this is the property to sum.
	 * @param {string=} configuration.weightPropertyName - If the array contains objects, this property's value is the weighting factor.
	 */
	class AverageResultProcessor extends ResultProcessor {
		constructor(configuration) {
			super(configuration);
		}

		_process(results) {
			let returnVal = null;

			if (is.array(results)) {
				returnVal = 0;

				const configuration = this._getConfiguration();

				const valuePropertyName = configuration.propertyName;
				const weightPropertyName = configuration.weightPropertyName;

				let extractValue;

				if (is.string(valuePropertyName)) {
					extractValue = item => attributes.read(item, valuePropertyName);
				} else {
					extractValue = item => item;
				}

				let extractWeight;

				if (is.string(valuePropertyName) && is.string(weightPropertyName)) {
					extractWeight = item => attributes.read(item, weightPropertyName);
				} else {
					extractWeight = extractOne;
				}

				let numerator = sum(results, extractValue, extractWeight);
				let denominator = sum(results, extractWeight, extractOne);

				if (is.number(numerator) && is.number(denominator) && denominator > 0) {
					returnVal = numerator / denominator;
				} else {
					returnVal = null;
				}
			}

			return returnVal;
		}

		toString() {
			return '[AverageResultProcessor]';
		}
	}

	function sum(items, extractValue, extractWeight) {
		let returnVal = 0;

		for (let i = 0; i < items.length; i++) {
			const item = items[i];

			const value = extractValue(item);
			const weight = extractWeight(item);

			if (is.number(value)) {
				returnVal = returnVal + value * weight;
			} else {
				returnVal = null;

				break;
			}
		}

		return returnVal;
	}

	return AverageResultProcessor;
})();