const assert = require('common/lang/assert'),
	is = require('common/lang/is');

const Attribute = require('./../../schema/definitions/Attribute'),
	OperatorType = require('./OperatorType');

module.exports = (() => {
	'use strict';

	/**
	 * An explicitly defined field of a DynamoDB record.
	 *
	 * @public
	 */
	class Expression {
		constructor(attribute, operatorType, operand) {
			this._attribute = attribute;
			this._operatorType = operatorType || null;
			this._operand = operand || null;
		}

		/**
		 * The {@link Attribute} targeted by the expression.
		 *
		 * @public
		 * @returns {Attribute}
		 */
		get attribute() {
			return this._attribute;
		}

		/**
		 * The {@link OperatorType} used by the expression.
		 *
		 * @public
		 * @returns {OperatorType}
		 */
		get operatorType() {
			return this._operatorType;
		}

		/**
		 * The operand used by the expression.
		 *
		 * @returns {*}
		 */
		get operand() {
			return this._operand;
		}

		/**
		 * Throws an {@link Error} if the instance is invalid.
		 *
		 * @public
		 */
		validate() {
			if (!(this._attribute instanceof Attribute)) {
				throw new Error('Expression data type is invalid.');
			}

			if (!(this._operatorType instanceof OperatorType)) {
				throw new Error('Expression data type is invalid.');
			}
		}

		toString() {
			return `[Expression]`;
		}
	}

	return Expression;
})();