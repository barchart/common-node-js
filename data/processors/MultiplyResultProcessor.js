var log4js = require('log4js');

var attributes = require('common/lang/attributes');
var is = require('common/lang/is');

var MutateResultProcessor = require('./MutateResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/MultiplyResultProcessor');

	/**
	 * Divides two numbers and assigns the result back to the context object.
	 *
	 * @public
	 * @extends MutateResultProcessor
	 * @param {object} configuration
	 * @param {string} configuration.propertyName - The property to which the result will be assigned.
	 * @param {number=} configuration.left - If provided, the left value.
	 * @param {string=} configuration.leftRef - The name of the property that holds the left value.
	 * @param {number=} configuration.right - If provided, the right value.
	 * @param {string=} configuration.rightRef - The name of the property that holds the right value.
	 */
	class MultiplyResultProcessor extends MutateResultProcessor {
		constructor(configuration) {
			super(configuration);
		}

		_processItem(resultItemToProcess, configurationToUse) {
			const propertyName = configurationToUse.propertyName;

			if (!is.string(propertyName)) {
				return;
			}

			let left;

			if (is.number(configurationToUse.left)) {
				left = configurationToUse.left;
			} else if (is.string(configurationToUse.leftRef)) {
				left = parseFloat(attributes.read(resultItemToProcess, configurationToUse.leftRef));
			} else {
				left = null;
			}

			let right;

			if (is.number(configurationToUse.right)) {
				right = configurationToUse.right;
			} else if (is.string(configurationToUse.rightRef)) {
				right = parseFloat(attributes.read(resultItemToProcess, configurationToUse.rightRef));
			} else {
				right = null;
			}

			if (is.number(left) && is.number(right)) {
				attributes.write(resultItemToProcess, propertyName, left * right);
			}
		}

		toString() {
			return '[MultiplyResultProcessor]';
		}
	}

	return MultiplyResultProcessor;
})();