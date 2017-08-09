const assert = require('common/lang/assert'),
	is = require('common/lang/is');

const KeyType = require('./../../schema/definitions/KeyType');

module.exports = (() => {
	'use strict';

	/**
	 * An operator type that can be used in an {@link Expression} as
	 * part of a {@link Scan} or {@link Query}.
	 *
	 * @public
	 * @param {String} description
	 * @param {Function} formatter
	 * @param {Number} operandCount
	 * @param {Array<KeyType>} keyTypes
	 */
	class OperatorType {
		constructor(description, formatter, operandCount, keyTypes) {
			assert.argumentIsRequired(description, 'description', String);
			assert.argumentIsRequired(formatter, 'formatter', Function);
			assert.argumentIsRequired(operandCount, 'operandCount', Number);
			assert.argumentIsArray(keyTypes, 'keyTypes', KeyType, 'KeyType');

			this._description = description;
			this._formatter = formatter;
			this._operandCount = operandCount;
			this._keyTypes = keyTypes;
		}

		/**
		 * Description of the operator.
		 *
		 * @public
		 * @returns {String}
		 */
		get description() {
			return this._description;
		}

		/**
		 * The number of expected operands (will be zero, one, or two).
		 *
		 * @public
		 * @returns {Number}
		 */
		get operandCount() {
			return this._operandCount;
		}

		/**
		 * Returns true, if the operator an be used with the {@link KeyType}.
		 *
		 * @public
		 * @param {KeyType} keyType - The type of key to check.
		 * @returns {Boolean|*}
		 */
		validFor(keyType) {
			assert.argumentIsRequired(keyType, 'keyType', KeyType, 'KeyType');

			return this._keyTypes.some(kt => kt === keyType);
		}

		/**
		 * Returns a string suitable for use in an AWS SDK expression.
		 *
		 * @public
		 * @param {String} field
		 * @param {String|Array<String>} operand
		 * @returns {String}
		 */
		format(field, operand) {
			assert.argumentIsRequired(field, 'field', String);

			if (this._operandCount === 2) {
				assert.argumentIsArray(operand, 'operand', String);
			} else if (this._operandCount === 1) {
				assert.argumentIsRequired(operand, 'operand', String);
			}

			return this._formatter(field, operand);
		}

		/**
		 * Equals.
		 *
		 * @public
		 * @returns {OperatorType}
		 */
		static get EQUALS() {
			return operatorTypeEquals;
		}

		/**
		 * Greater than.
		 *
		 * @public
		 * @returns {OperatorType}
		 */
		static get GREATER_THAN() {
			return operatorTypeGreaterThan;
		}

		/**
		 * Less than.
		 *
		 * @public
		 * @returns {OperatorType}
		 */
		static get LESS_THAN() {
			return operatorTypeLessThan;
		}

		/**
		 * Greater than or equal to.
		 *
		 * @public
		 * @returns {OperatorType}
		 */
		static get GREATER_THAN_OR_EQUAL_TO() {
			return operatorTypeGreaterThanOrEqualTo;
		}

		/**
		 * Less than or equal to.
		 *
		 * @public
		 * @returns {OperatorType}
		 */
		static get LESS_THAN_OR_EQUAL_TO() {
			return operatorTypeLessThanOrEqualTo;
		}

		/**
		 * Between.
		 *
		 * @public
		 * @returns {OperatorType}
		 */
		static get BETWEEN() {
			return operatorTypeBetween;
		}

		/**
		 * Attribute doesn't exist (for use with {@link Conditional} instances only}).
		 *
		 * @public
		 * @returns {OperatorType}
		 */
		static get ATTRIBUTE_NOT_EXISTS() {
			return operatorTypeAttributeNotExists;
		}

		toString() {
			return `[OperatorType (description=${this._description})]`;
		}
	}

	const operatorTypeEquals = new OperatorType('Equals', (f, o) => `${f} = ${o}`, 1, [ KeyType.HASH, KeyType.RANGE ]);
	const operatorTypeGreaterThan = new OperatorType('Greater Than', (f, o) => `${f} > ${o}`, 1, [ KeyType.RANGE ]);
	const operatorTypeLessThan = new OperatorType('Less Than', (f, o) => `${f} < ${o}`, 1, [ KeyType.RANGE ]);
	const operatorTypeGreaterThanOrEqualTo = new OperatorType('Greater Than Or Equal To', (f, o) => `${f} >= ${o}`, 1, [ KeyType.RANGE ]);
	const operatorTypeLessThanOrEqualTo = new OperatorType('Less Than Or Equal To', (f, o) => `${f} <= ${o}`, 1, [ KeyType.RANGE ]);
	const operatorTypeBetween = new OperatorType('Between', (f, o) => `${f} BETWEEN ${o[0]} AND ${o[1]}`, 2, [ KeyType.RANGE ]);
	const operatorTypeAttributeNotExists = new OperatorType('Attribute Not Exists', (f, o) => `attribute_not_exists(${f})`, 0, [ KeyType.HASH, KeyType.RANGE ]);

	return OperatorType;
})();