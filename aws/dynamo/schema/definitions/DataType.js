const assert = require('common/lang/assert'),
	Enum = require('common/lang/Enum'),
	is = require('common/lang/is');

module.exports = (() => {
	'use strict';

	/**
	 * A data type that used by DynamoDB attributes.
	 *
	 * @public
	 */
	class DataType {
		constructor(code, description, enumerationType) {
			assert.argumentIsRequired(code, 'code', String);
			assert.argumentIsRequired(description, 'description', String);
			assert.argumentIsOptional(enumerationType, 'enumerationType', Function);

			if (enumerationType) {
				assert.argumentIsValid(enumerationType, 'enumerationType', extendsEnumeration, 'is an enumeration');
			}

			this._code = code;
			this._description = description;
			this._enumerationType = enumerationType || null;
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
		 * The {@Enumeration} type.
		 *
		 * @public
		 * @returns {Function|null}
		 */
		get enumerationType() {
			return this._enumerationType;
		}

		static forEnum(EnumerationType, description) {
			return new DataType('S', description, EnumerationType)
		}

		/**
		 * References a string.
		 *
		 * @returns {DataType}
		 */
		static get STRING() {
			return dataTypeString;
		}

		/**
		 * References a number.
		 *
		 * @returns {DataType}
		 */
		static get NUMBER() {
			return dataTypeNumber;
		}

		/**
		 * References a Boolean value.
		 *
		 * @returns {DataType}
		 */
		static get BOOLEAN() {
			return dataTypeBoolean;
		}

		/**
		 * References an object (serialized as JSON).
		 *
		 * @returns {DataType}
		 */
		static get JSON() {
			return dataTypeJson;
		}

		/**
		 * References a {@link Decimal} instance.
		 *
		 * @returns {DataType}
		 */
		static get DECIMAL() {
			return dataTypeDecimal;
		}

		/**
		 * References a {@link Day} instance.
		 *
		 * @returns {DataType}
		 */
		static get DAY() {
			return dataTypeDay;
		}

		/**
		 * References a {@link Timestamp} instance.
		 *
		 * @returns {DataType}
		 */
		static get TIMESTAMP() {
			return dataTypeTimestamp;
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

	function extendsEnumeration(EnumerationType) {
		return is.extension(Enum, EnumerationType);
	}

	const dataTypeString = new DataType('S', 'String');
	const dataTypeNumber = new DataType('N', 'Number');
	const dataTypeBoolean = new DataType('BOOL', 'Boolean');

	const dataTypeJson = new DataType('S', 'Json');
	const dataTypeDecimal = new DataType('S', 'Decimal');
	const dataTypeDay = new DataType('S', 'Day');
	const dataTypeTimestamp = new DataType('N', 'Timestamp');

	const dataTypes = [
		dataTypeString,
		dataTypeNumber,
		dataTypeBoolean,
		dataTypeJson,
		dataTypeDecimal,
		dataTypeDay,
		dataTypeTimestamp
	];

	return DataType;
})();