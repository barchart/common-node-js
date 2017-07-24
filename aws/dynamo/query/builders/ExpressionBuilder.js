const assert = require('common/lang/assert');

const Expression = require('./../defintions/Expression'),
	OperatorType = require('./OperatorType');

module.exports = (() => {
	'use strict';

	/**
	 * Fluent interface for building an {@link Expression}.
	 *
	 * @public
	 */
	class ExpressionBuilder {
		/**
		 * @param {string} attributeName
		 * @param {LookupBuilder} parent
		 */
		constructor(attributeName, parent) {
			assert.argumentIsRequired(attributeName, 'attributeName', String);

			this._expression = new Expression(getAttribute(attributeName, parent), null, null);
		}

		/**
		 * The {@link Expression}, given all the information provided thus far.
		 *
		 * @public
		 */
		get expression() {
			return this._expression;
		}

		/**
		 * Set the {@link OperatorType} and returns the current instance.
		 *
		 * @public
		 * @param {OperatorType} operatorType
		 * @returns {ExpressionBuilder}
		 */
		withOperatorType(operatorType) {
			assert.argumentIsRequired(operatorType, 'operatorType', OperatorType, 'OperatorType');

			this._expression = new Expression(this._expression.attribute, operatorType, this._expression.operand);

			return this;
		}

		/**
		 * Set the operand and returns the current instance.
		 *
		 * @public
		 * @param {*} operand
		 * @returns {ExpressionBuilder}
		 */
		withOperand(operand) {
			this._expression = new Expression(this._expression.attribute, this._expression.operatorType, operand);

			return this;
		}

		/**
		 * Constructs a new, and incomplete, {@link ExpressionBuilder}.
		 *
		 * @public
		 * @param {Attribute} attribute
		 * @returns {ExpressionBuilder}
		 */
		static withAttribute(attribute) {
			return new ExpressionBuilder(attribute);
		}

		toString() {
			return '[ExpressionBuilder]';
		}
	}

	function getAttribute(name, parent) {
		return parent.lookup.table.attributes.find(a => a.name === name) || null;
	}

	return ExpressionBuilder;
})();