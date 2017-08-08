const assert = require('common/lang/assert');

const AttributeSerializer = require('./AttributeSerialzer'),
	DataType = require('./../../definitions/DataType');

module.exports = (() => {
	'use strict';

	/**
	 * Converts a number into (and back from) the representation used
	 * on a DynamoDB record.
	 */
	class NumberSerializer extends AttributeSerializer {
		constructor() {
			super();
		}

		serialize(value) {
			assert.argumentIsRequired(value, 'value', Number);

			const wrapper = { };

			wrapper[DataType.NUMBER.code] = value.toString();

			return wrapper;
		}

		deserialize(wrapper) {
			return parseFloat(wrapper[DataType.NUMBER.code]);
		}

		static get INSTANCE() {
			return instance;
		}

		toString() {
			return '[NumberSerializer]';
		}
	}

	const instance = new NumberSerializer();

	return NumberSerializer;
})();