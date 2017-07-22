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
	 *
	 * @public
	 */
	class Serializer {
		constructor() {

		}

		/**
		 * Returns true if the item can be serialized; otherwise false.
		 *
		 * @public
		 * @param {Object} item - The serialization candidate.
		 * @param {Table} table - The schema to check the candidate against.
		 * @param {Boolean=} relaxed - If true, only key attributes will be checked.
		 * @returns {Boolean}
		 */
		static validate(item, table, relaxed) {
			assert.argumentIsRequired(table, 'table', Table, 'Table');

			let returnVal = is.object(item);

			if (returnVal) {
				const validateAttribute = (a) => item.hasOwnProperty(a.name) && serializers.has(a.name) && serializers.get(a.name).canCoerce(item[a.name]);

				if (is.boolean(relaxed) && relaxed) {
					returnVal = table.keys.every(k => validateAttribute(k.attribute));
				} else {
					returnVal = table.attributes.every(validateAttribute);
				}
			}

			return returnVal;
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
					serialized[name] = serializers.get(attribute.dataType).serialize(item[name]);
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

	return Serializer;
})();