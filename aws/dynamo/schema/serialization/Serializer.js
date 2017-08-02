const assert = require('common/lang/assert'),
	is = require('common/lang/is');

const ComponentType = require('./../../schema/definitions/ComponentType'),
	DataType = require('./../../schema/definitions/DataType'),
	Table = require('./../../schema/definitions/Table');

const JsonSerializer = require('./attributes/JsonSerializer'),
	NumberSerializer = require('./attributes/NumberSerializer'),
	StringSerializer = require('./attributes/StringSerializer');

const MoneySerializer = require('./components/MoneySerializer');

module.exports = (() => {
	'use strict';

	/**
	 * Utilities for converting objects to (and from) a DynamoDB representation.
	 *
	 * @public
	 */
	class Serializer {
		constructor() {

		}

		/**
		 * Converts a simple object into one suitable for use with the
		 * AWS SDK for DynamoDB. This operation is the inverse of
		 * {@link Serializer.deserialize}.
		 *
		 * @public
		 * @param {Object} item - The object to serialize (for DynamoDB).
		 * @param {Table} table - The schema that controls serialization of the object.
		 * @returns {Object} - The serialized object.
		 */
		static serialize(item, table) {
			assert.argumentIsRequired(item, 'item', Object);
			assert.argumentIsRequired(table, 'table', Table, 'Table');

			return table.attributes.reduce((serialized, attribute) => {
				const name = attribute.name;

				if (item.hasOwnProperty(name) && !is.undefined(item[name])) {
					serialized[name] = Serializer.serializeValue(item[name], attribute.dataType);
				}

				return serialized;
			}, { });
		}

		/**
		 * Converts a DynamoDB object into a simple JavaScript object. This
		 * operation is the inverse of {@link Serializer.serialize}.
		 *
		 * @public
		 * @param {Object} item - The DynamoDB formatted object to deserialize.
		 * @param {Table} table - The schema that controls serialization of the object.
		 * @returns {Object} - The deserialized object.
		 */
		static deserialize(item, table) {
			assert.argumentIsRequired(item, 'item', Object);
			assert.argumentIsRequired(table, 'table', Table, 'Table');

			return table.attributes.reduce((deserialized, attribute) => {
				const name = attribute.name;

				if (item.hasOwnProperty(name)) {
					deserialized[name] = serializers.get(attribute.dataType).deserialize(item[name]);
				}

				return deserialized;
			}, { });
		}

		/**
		 * Converts a simple value into an object suitable for use with the
		 * AWS SDK for DynamoDB.
		 *
		 * @public
		 * @param {Object} item - The value to serialize (for DynamoDB).
		 * @param {DataType} dataType - The value's data type.
		 * @returns {Object} - The serialized object.
		 */
		static serializeValue(value, dataType) {
			assert.argumentIsRequired(dataType, 'dataType', DataType, 'DataType');

			return serializers.get(dataType).serialize(value);
		}

		/**
		 * Returns true if the value can be coerced to the specified {@link DataType}
		 * without an error occurring.
		 *
		 * @param {*} value - The value to check.
		 * @returns {boolean}
		 */
		static canCoerce(value, dataType) {
			return serializers.has(dataType) && serializers.get(dataType).canCoerce(value);
		}

		/**
		 * Accepts a value (of any type) and attempts to coerce it to the
		 * simple type used by the appropriate {@link DataType}.
		 *
		 * @public
		 * @param {*|Object} value - The value to coerce.
		 * @param {DataType} dataType - The {@link DataType} which describes the desired output type.
		 * @returns {*|Object} - The coerced value.
		 */
		static coerce(value, dataType) {
			assert.argumentIsRequired(dataType, 'dataType', DataType, 'DataType');

			return serializers.get(dataType).coerce(value);
		}

		toString() {
			return '[Serializer]';
		}
	}

	const serializers = new Map();

	serializers.set(DataType.NUMBER, new NumberSerializer());
	serializers.set(DataType.STRING, new StringSerializer());
	serializers.set(DataType.JSON, new JsonSerializer());

	const components = new Map();

	components.add(ComponentType.MONEY, new MoneySerializer());

	return Serializer;
})();