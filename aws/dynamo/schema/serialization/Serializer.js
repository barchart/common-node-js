const assert = require('common/lang/assert'),
	is = require('common/lang/is');

const DataType = require('./../../schema/definitions/DataType');

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

		static serialize(item, table) {
			assert.argumentIsRequired(item, 'item', Object);

			return {
				Item: table.attributes.reduce((serialized, attribute) => {
					const name = attribute.name;

					if (item.hasOwnProperty(name) && !is.undefined(item[name])) {
						serialized[name] = serializers.get(attribute.dataType).serialize(item[name]);
					}

					return serialized;
				}, { })
			};
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