const assert = require('common/lang/assert'),
	is = require('common/lang/is');

const DataType = require('./../../schema/definitions/DataType'),
	Table = require('./../../schema/definitions/Table');

const NumberSerializer = require('./attributes/NumberSerializer'),
	StringSerializer = require('./attributes/StringSerializer');

module.exports = (() => {
	'use strict';

	/**
	 * Converts an object to (and from) a DynamoDB representation.
	 */
	class Serializer {
		constructor() {

		}

		/**
		 * Converts a simple object into one suitable for use with the
		 * AWS SDK for DynamoDB. This operation is the inverse of
		 * {@link Serializer.deserialize}.
		 *
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
					serialized[name] = serializers.get(attribute.dataType).serialize(item[name]);
				}

				return serialized;
			}, { });
		}

		/**
		 * Converts a DynamoDB object into a simple JavaScript object. This
		 * operation is the inverse of {@link Serializer.serialize}.
		 *
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

	return Serializer;
})();