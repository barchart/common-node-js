const assert = require('common/lang/assert');

module.exports = (() => {
	'use strict';

	/**
	 * A data type that used by DynamoDB attributes.
	 *
	 * @public
	 */
	class DataType {
		constructor(code, description) {
			assert.argumentIsRequired(code, 'code', String);
			assert.argumentIsRequired(description, 'description', String);

			this._code = code;
			this._description = description;
		}

		/**
		 * Unique code used by Amazon to describe the data type.
		 *
		 * @public
		 * @returns {String}
		 */
		get code() {
			return this._code;
		}

		/**
		 * Description of the data type.
		 *
		 * @public
		 * @returns {String}
		 */
		get description() {
			return this._description;
		}

		/**
		 * A string.
		 *
		 * @returns {DataType}
		 */
		static get STRING() {
			return dataTypeString;
		}

		/**
		 * A number.
		 *
		 * @returns {DataType}
		 */
		static get NUMBER() {
			return dataTypeNumber;
		}

		/**
		 * A Boolean value.
		 *
		 * @returns {DataType}
		 */
		static get BOOLEAN() {
			return dataTypeBoolean;
		}

		/**
		 * An object (serialized as JSON).
		 *
		 * @returns {DataType}
		 */
		static get JSON() {
			return dataTypeJson;
		}

		/**
		 * An {@link Decimal} instance.
		 *
		 * @returns {DataType}
		 */
		static get DECIMAL() {
			return dataTypeDecimal;
		}

		/**
		 * Description of the data type (or null, if no known {@link DataType} can be found).
		 *
		 * @public
		 * @param {string} code - The code of the {@link DataType} instance to find.
		 * @returns {DataType|null}
		 */
		static fromCode(code) {
			assert.argumentIsRequired(code, 'code', String);

			return dataTypes.find(dt => dt.code === code) || null;
		}

		toString() {
			return `[DataType (code=${this._code}, description=${this._description})]`;
		}
	}

	const dataTypeString = new DataType('S', 'String');
	const dataTypeNumber = new DataType('N', 'Number');
	const dataTypeBoolean = new DataType('BOOL', 'Boolean');

	const dataTypeJson = new DataType('S', 'Json');
	const dataTypeDecimal = new DataType('S', 'Decimal');

	const dataTypes = [
		dataTypeString,
		dataTypeNumber,
		dataTypeBoolean,
		dataTypeJson,
		dataTypeDecimal
	];

	return DataType;
})();