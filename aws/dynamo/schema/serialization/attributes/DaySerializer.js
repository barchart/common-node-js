const assert = require('common/lang/assert'),
	Day = require('common/lang/Day');

const DelegateSerializer = require('./DelegateSerializer'),
	StringSerializer = require('./StringSerializer');

module.exports = (() => {
	'use strict';

	/**
	 * Converts a {@link Timestamp} instance into (and back from) the
	 * representation used on a DynamoDB record.
	 */
	class DaySerializer extends DelegateSerializer {
		constructor() {
			super(StringSerializer.INSTANCE, serializeDay, deserializeDay);
		}

		static get INSTANCE() {
			return instance;
		}

		toString() {
			return '[DaySerializer]';
		}
	}

	function serializeDay(value) {
		assert.argumentIsRequired(value, 'value', Day, 'Day');

		return value.format();
	}

	function deserializeDay(value) {
		return Day.parse(value);
	}

	const instance = new DaySerializer();

	return DaySerializer;
})();