const assert = require('common/lang/assert'),
	is = require('common/lang/is');

const ComponentType = require('./../../schema/definitions/ComponentType'),
	DataType = require('./../../schema/definitions/DataType'),
	Table = require('./../../schema/definitions/Table');

const AttributeDeserializationWriter = require('./writers/AttributeDeserializationWriter'),
	AttributeSerializationWriter = require('./writers/AttributeSerializationWriter'),
	ComponentDeserializationWriter = require('./writers/ComponentDeserializationWriter'),
	ComponentSerializationWriter = require('./writers/ComponentSerializationWriter'),
	CompositeWriter = require('./writers/CompositeWriter');

module.exports = (() => {
	'use strict';

	/**
	 * Utilities for converting objects to (and from) a DynamoDB representation (no
	 * instance-level functionality exists -- static functions only).
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

			return getSerializationWriter(table).write(item, { });
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

			return getDeserializationWriter(table).write(item, { });
		}

		toString() {
			return '[Serializer]';
		}
	}

	const serializers = new Map();
	const deserializers = new Map();

	function getSerializationWriter(table) {
		if (!serializers.has(table)) {
			const attributeWriters = table.attributes.map(a => new AttributeSerializationWriter(a));
			const componentWriters = table.components.map(c => new ComponentSerializationWriter(c));

			serializers.set(table, new CompositeWriter(attributeWriters.concat(componentWriters)));
		}

		return serializers.get(table);
	}

	function getDeserializationWriter(table) {
		if (!deserializers.has(table)) {
			const attributeWriters = table.attributes.map(a => new AttributeDeserializationWriter(a));
			const componentWriters = table.components.map(c => new ComponentDeserializationWriter(c));

			deserializers.set(table, new CompositeWriter(attributeWriters.concat(componentWriters)));
		}

		return deserializers.get(table);
	}

	return Serializer;
})();