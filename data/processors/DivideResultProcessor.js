var log4js = require('log4js');

var attributes = require('common/lang/attributes');
var is = require('common/lang/is');

var BinaryOperatorResultProcessor = require('./BinaryOperatorResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/DivideResultProcessor');

	/**
	 * Divides two numbers and assigns the result.
	 *
	 * @public
	 * @extends BinaryOperatorResultProcessor
	 * @param {object} configuration
	 * @param {string} configuration.propertyName - The property to which the result will be assigned.
	 * @param {number=} configuration.numerator - If provided, the left value.
	 * @param {string=} configuration.numeratorRef - The name of the property that holds the left value.
	 * @param {number=} configuration.denominator - If provided, the right value.
	 * @param {string=} configuration.denominatorRef - The name of the property that holds the right value.
	 */
	class DivideResultProcessor extends BinaryOperatorResultProcessor {
		constructor(configuration) {
			super(Object.assign(configuration, {
				left: configuration.numerator,
				right: configuration.denominator,
				leftRef: configuration.numeratorRef,
				rightRef: configuration.denominatorRef
			}));
		}

		_validateRight(right) {
			return is.number(right) && right !== 0;
		}

		_evaluate(left, right) {
			return left / right;
		}

		toString() {
			return '[DivideResultProcessor]';
		}
	}

	return DivideResultProcessor;
})();