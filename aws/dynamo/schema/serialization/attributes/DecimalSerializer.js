const assert = require('common/lang/assert'),
	Decimal = require('common/lang/Decimal');

const AttributeSerializer = require('./AttributeSerialzer'),
	DataType = require('./../../definitions/DataType');

module.exports = (() => {
	'use strict';

	/**
	 * Converts a {@link Decimal} into (and back from) the representation used
	 * on a DynamoDB record.
	 */
	class DecimalSerializer extends AttributeSerializer {
		constructor() {
			super();
		}

		serialize(value) {
			const wrapper = { };

			wrapper[DataType.DECIMAL.code] = this.coerce(value);

			return wrapper;
		}

		deserialize(wrapper) {
			return new Decimal(wrapper[DataType.DECIMAL.code]);
		}

		coerce(value) {
			assert.argumentIsRequired(value, 'value', Decimal, 'Decimal');

			return value.toFixed();
		}

		toString() {
			return '[DecimalSerializer]';
		}
	}

	return DecimalSerializer;
})();