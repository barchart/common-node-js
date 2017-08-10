const assert = require('common/lang/assert'),
	Timestamp = require('common/lang/Timestamp');

const DelegateSerializer = require('./DelegateSerializer'),
	NumberSerializer = require('./NumberSerializer');

module.exports = (() => {
	'use strict';

	/**
	 * Converts a {@link Timestamp} instance into (and back from) the
	 * representation used on a DynamoDB record.
	 */
	class TimestampSerializer extends DelegateSerializer {
		constructor() {
			super(NumberSerializer.INSTANCE, serializeTimestamp, deserializeTimestamp);
		}

		static get INSTANCE() {
			return instance;
		}

		toString() {
			return '[TimestampSerializer]';
		}
	}

	function serializeTimestamp(value) {
		assert.argumentIsRequired(value, 'value', Timestamp, 'Timestamp');

		return value.timestamp;
	}

	function deserializeTimestamp(value) {
		return new Timestamp(value);
	}

	const instance = new TimestampSerializer();

	return TimestampSerializer;
})();