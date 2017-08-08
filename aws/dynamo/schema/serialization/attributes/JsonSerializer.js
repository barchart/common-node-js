const assert = require('common/lang/assert'),
	Decimal = require('common/lang/Decimal');

const DataType = require('./../../definitions/DataType'),
	DelegateSerializer = require('./AttributeSerialzer'),
	StringSerializer = require('./StringSerializer');

module.exports = (() => {
	'use strict';

	/**
	 * Converts an object into (and back from) the representation used
	 * on a DynamoDB record using JSON strings.
	 */
	class JsonSerializer extends DelegateSerializer {
		constructor() {
			super(StringSerializer.INSTANCE, serializeJson, deserializeJson);
		}

		static get INSTANCE() {
			return instance;
		}

		toString() {
			return '[JsonSerializer]';
		}
	}

	function serializeJson(value) {
		assert.argumentIsRequired(value, 'value', Object);

		return JSON.stringify(value);
	}

	function deserializeJson(value) {
		return JSON.parse(value)
	}

	const instance = new JsonSerializer();

	return JsonSerializer;
})();