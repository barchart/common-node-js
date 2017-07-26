const assert = require('common/lang/assert');

const StringSerializer = require('./StringSerializer'),
	DataType = require('./../../definitions/DataType');

module.exports = (() => {
	'use strict';

	/**
	 * Converts an object into (and back from) the representation used
	 * on a DynamoDB record.
	 *
	 * @interface
	 */
	class JsonSerializer extends StringSerializer {
		constructor() {
			super();
		}

		serialize(value) {
			return super.serialize(JSON.stringify(value));
		}

		deserialize(wrapper) {
			return JSON.parse(super.deserialize(wrapper));
		}

		coerce(value) {
			return value;
		}

		toString() {
			return '[JsonSerializer]';
		}
	}

	return JsonSerializer;
})();