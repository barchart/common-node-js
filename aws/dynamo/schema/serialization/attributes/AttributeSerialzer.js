const assert = require('common/lang/assert');

module.exports = (() => {
	'use strict';

	/**
	 * Converts a value into (and back from) the representation used
	 * on a DynamoDB record.
	 *
	 * @interface
	 */
	class AttributeSerializer {
		constructor() {

		}

		serialize(value) {
			return value;
		}

		deserialize(wrapper) {
			return wrapper;
		}

		toString() {
			return '[AttributeSerializer]';
		}
	}

	return AttributeSerializer;
})();