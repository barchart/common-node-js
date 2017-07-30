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
	 */
	class OperatorType {
		constructor(description, formatter, operandIsArray, keyTypes) {
			assert.argumentIsRequired(description, 'description', String);
			assert.argumentIsRequired(formatter, 'formatter', Function);
			assert.argumentIsRequired(operandIsArray, 'operandIsArray', Boolean);
			assert.argumentIsArray(keyTypes, 'keyTypes', KeyType, 'KeyType');

			this._description = description;
			this._formatter = formatter;
			this._operandIsArray = operandIsArray;
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
		 * Returns true, if the operand must be an array of values.
		 *
		 * @returns {Boolean}
		 */
		get operandIsArray() {
			return this._operandIsArray;
		}

		/**
		 * Returns true, if the operator an be used with the {@link KeyType}.
		 *
		 * @param {KeyType} keyType - The type of key to check.
		 * @returns {boolean|*}
		 */
		validFor(keyType) {
			assert.argumentIsRequired(keyType, 'keyType', KeyType, 'KeyType');

			return this._keyTypes.some(kt => kt === keyType);
		}

		/**
		 * Returns a string suitable for use in an AWS SDK expression.
		 *
		 * @param {String} field
		 * @param {String|Array<String>} operand
		 * @returns {String}
		 */
		format(field, operand) {
			assert.argumentIsRequired(field, 'field', String);

			if (this._operandIsArray) {
				assert.argumentIsArray(operand, 'operand', String);
			} else {
				assert.argumentIsRequired(operand, 'operand', String);
			}

			return this._formatter(field, operand);
		}

		static get EQUALS() {
			return operatorTypeEquals;
		}

		static get GREATER_THAN() {
			return operatorTypeGreaterThan;
		}

		static get LESS_THAN() {
			return operatorTypeLessThan;
		}

		static get GREATER_THAN_OR_EQUAL_TO() {
			return operatorTypeGreaterThanOrEqualTo;
		}

		static get LESS_THAN_OR_EQUAL_TO() {
			return operatorTypeLessThanOrEqualTo;
		}

		static get BETWEEN() {
			return operatorTypeBetween;
		}

		toString() {
			return `[OperatorType (description=${this._description})]`;
		}
	}

	const operatorTypeEquals = new OperatorType('Equals', (f, o) => `${f} = ${o}`, false, [ KeyType.HASH, KeyType.RANGE ]);
	const operatorTypeGreaterThan = new OperatorType('Greater Than', (f, o) => `${f} > ${o}`, false, [ KeyType.RANGE ]);
	const operatorTypeLessThan = new OperatorType('Less Than', (f, o) => `${f} < ${o}`, false, [ KeyType.RANGE ]);
	const operatorTypeGreaterThanOrEqualTo = new OperatorType('Greater Than Or Equal To', (f, o) => `${f} >= ${o}`, false, [ KeyType.RANGE ]);
	const operatorTypeLessThanOrEqualTo = new OperatorType('Less Than Or Equal To', (f, o) => `${f} <= ${o}`, false, [ KeyType.RANGE ]);
	const operatorTypeBetween = new OperatorType('Between', (f, o) => `${f} BETWEEN ${o[0]} AND ${o[1]}`, true, [ KeyType.RANGE ]);

	return OperatorType;
})();