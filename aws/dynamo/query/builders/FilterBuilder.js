const assert = require('common/lang/assert');

const Filter = require('./../definitions/Filter');

const ExpressionBuilder = require('./ExpressionBuilder');

module.exports = (() => {
	'use strict';

	/**
	 * Fluent interface for building a {@link Filter}.
	 *
	 * @public
	 */
	class FilterBuilder {
		/**
		 * @param {LookupBuilder} parent
		 */
		constructor(parent) {
			this._filter = new Filter([ ]);
			this._parent = parent;
		}

		/**
		 * The {@link Filter}, given all the information provided thus far.
		 *
		 * @public
		 */
		get filter() {
			return this._filter;
		}

		/**
		 * Adds an {@link Expression} to the filter, given all the
		 * components of an expression, then returns the current instance.
		 *
		 * @public
		 * @param {Attribute} attributeName - The attribute name.
		 * @param {OperatorType} operatorType
		 * @param {*} operand
		 * @returns {FilterBuilder}
		 */
		withExpression(attributeName, operatorType, operand) {
			return this.withExpressionBuilder(attributeName, eb => eb.withOperatorType(operatorType).withOperand(operand));
		}

		/**
		 * Adds an {@link Expression} to the filter, using a callback that
		 * provides the consumer with an {@ExpressionBuilder}, then returns
		 * the current instance.
		 *
		 * @public
		 * @param {Attribute} attributeName - The {@link Attribute} to target.
		 * @param {Function} callback - Synchronously called, providing a {@link ExpressionBuilder} tied to the current instance.
		 * @returns {FilterBuilder}
		 */
		withExpressionBuilder(attributeName, callback) {
			assert.argumentIsRequired(attributeName, 'attributeName', String);
			assert.argumentIsRequired(callback, 'callback', Function);

			const expressionBuilder = new ExpressionBuilder(attributeName, this._parent);

			callback(expressionBuilder);

			return addExpressionBuilder.call(this, expressionBuilder);
		}

		toString() {
			return '[FilterBuilder]';
		}
	}

	function addExpressionBuilder(expressionBuilder) {
		this._filter = new Filter(this._filter.expressions.concat([ expressionBuilder.expression ]));

		return this;
	}

	return FilterBuilder;
})();