const assert = require('common/lang/assert'),
	Decimal = require('common/lang/Decimal');

const DataType = require('./../../definitions/DataType'),
	DelegateSerializer = require('./DelegateSerializer'),
	StringSerializer = require('./StringSerializer');

module.exports = (() => {
	'use strict';

	/**
	 * Converts a {@link Decimal} into (and back from) the representation used
	 * on a DynamoDB record.
	 */
	class DecimalSerializer extends DelegateSerializer {
		constructor() {
			super(StringSerializer.INSTANCE, serializeDecimal, deserializeDecimal);
		}

		static get INSTANCE() {
			return instance;
		}

		toString() {
			return '[DecimalSerializer]';
		}
	}

	function serializeDecimal(value) {
		assert.argumentIsRequired(value, 'value', Decimal);

		return value.toFixed();
	}

	function deserializeDecimal(value) {
		return new Decimal(value);
	}

	const instance = new DecimalSerializer();

	return DecimalSerializer;
})();