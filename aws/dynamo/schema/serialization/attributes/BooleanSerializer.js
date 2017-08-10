const assert = require('common/lang/assert');

const AttributeSerializer = require('./AttributeSerialzer'),
	DataType = require('./../../definitions/DataType');

module.exports = (() => {
	'use strict';

	/**
	 * Converts a number into (and back from) the representation used
	 * on a DynamoDB record.
	 */
	class BooleanSerializer extends AttributeSerializer {
		constructor() {
			super();
		}

		serialize(value) {
			assert.argumentIsRequired(value, 'value', Boolean);

			const wrapper = { };

			wrapper[DataType.BOOLEAN.code] = value;

			return wrapper;
		}

		deserialize(wrapper) {
			return wrapper[DataType.BOOLEAN.code];
		}

		static get INSTANCE() {
			return instance;
		}

		toString() {
			return '[BooleanSerializer]';
		}
	}

	const instance = new BooleanSerializer();

	return BooleanSerializer;
})();