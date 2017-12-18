const assert = require('@barchart/common-js/lang/assert'),
	Enum = require('@barchart/common-js/lang/Enum'),
	is = require('@barchart/common-js/lang/is');

module.exports = (() => {
	'use strict';

	/**
	 * A data type that used by DynamoDB attributes.
	 *
	 * @public
	 * @param {String} code
	 * @param {String} description
	 * @param {Function=} enumerationType
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

		/**
		 * Creates a {@link DataType} for an {@link Enum}.
		 *
		 * @public
		 * @param {Function} EnumerationType - A type that inherits {@link Enum}
		 * @param {String} description
		 * @returns {DataType}
		 */
		static forEnum(EnumerationType, description) {
			return new DataType('S', description, EnumerationType);
		}

		/**
		 * References a {@link Buffer} instance.
		 *
		 * @returns {DataType}
		 * @constructor
		 */
		static get BINARY() {
			return dataTypeBinary;
		}


		/**
		 * References a Boolean value.
		 *
		 * @public
		 * @returns {DataType}
		 */
		static get BOOLEAN() {
			return dataTypeBoolean;
		}

		/**
		 * References a number.
		 *
		 * @public
		 * @returns {DataType}
		 */
		static get NUMBER() {
			return dataTypeNumber;
		}

		/**
		 * References a string.
		 *
		 * @public
		 * @returns {DataType}
		 */
		static get STRING() {
			return dataTypeString;
		}

		/**
		 * References an object (serialized as JSON).
		 *
		 * @public
		 * @returns {DataType}
		 */
		static get JSON() {
			return dataTypeJson;
		}

		/**
		 * References a {@link Day} instance.
		 *
		 * @public
		 * @returns {DataType}
		 */
		static get DAY() {
			return dataTypeDay;
		}

		/**
		 * References a {@link Decimal} instance.
		 *
		 * @public
		 * @returns {DataType}
		 */
		static get DECIMAL() {
			return dataTypeDecimal;
		}

		/**
		 * References a {@link Timestamp} instance.
		 *
		 * @public
		 * @returns {DataType}
		 */
		static get TIMESTAMP() {
			return dataTypeTimestamp;
		}

		/**
		 * References a {@link Buffer} instance (serialized with compression).
		 *
		 * @returns {DataType}
		 * @constructor
		 */
		static get BINARY_COMPRESSED() {
			return dataTypeBinaryCompressed;
		}

		/**
		 * References a string (serialized with compression).
		 *
		 * @public
		 * @returns {DataType}
		 */
		static get STRING_COMPRESSED() {
			return dataTypeStringCompressed;
		}

		/**
		 * References an object (serialized as JSON, and using compression).
		 *
		 * @public
		 * @returns {DataType}
		 */
		static get JSON_COMPRESSED() {
			return dataTypeJsonCompressed;
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

	const dataTypeBinary = new DataType('B', 'Binary');
	const dataTypeBoolean = new DataType('BOOL', 'Boolean');
	const dataTypeNumber = new DataType('N', 'Number');
	const dataTypeString = new DataType('S', 'String');

	const dataTypeJson = new DataType('S', 'Json');

	const dataTypeDay = new DataType('S', 'Day');
	const dataTypeDecimal = new DataType('S', 'Decimal');
	const dataTypeTimestamp = new DataType('N', 'Timestamp');

	const dataTypeBinaryCompressed = new DataType('B', 'Binary (Compressed)');
	const dataTypeStringCompressed = new DataType('B', 'String (Compressed)');
	const dataTypeJsonCompressed = new DataType('B', 'Json (Compressed)');

	const dataTypes = [
		dataTypeNumber,
		dataTypeBoolean,
		dataTypeString,
		dataTypeStringCompressed,
		dataTypeJson,
		dataTypeJsonCompressed,
		dataTypeDecimal,
		dataTypeDay,
		dataTypeTimestamp,
		dataTypeBinary,
		dataTypeBinaryCompressed
	];

	return DataType;
})();