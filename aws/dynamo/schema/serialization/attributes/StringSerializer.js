const assert = require('common/lang/assert');

const AttributeSerializer = require('./AttributeSerialzer'),
	DataType = require('./../../definitions/DataType');

module.exports = (() => {
	'use strict';

	/**
	 * Converts a number into (and back from) the representation used
	 * on a DynamoDB record.
	 *
	 * @interface
	 */
	class StringSerializer extends AttributeSerializer {
		constructor() {
			super();
		}

		serialize(value) {
			assert.argumentIsRequired(value, 'value', String);

			const wrapper = { };

			wrapper[DataType.STRING.code] = value;

			return wrapper;
		}

		deserialize(wrapper) {
			return wrapper[DataType.STRING.code];
		}

		toString() {
			return '[StringSerializer]';
		}
	}

	return StringSerializer;
})();