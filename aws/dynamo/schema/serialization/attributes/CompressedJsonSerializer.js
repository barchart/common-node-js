const assert = require('@barchart/common-js/lang/assert');

const CompressedBinarySerializer = require('./CompressedBinarySerializer'),
	DelegateSerializer = require('./DelegateSerializer');

module.exports = (() => {
	'use strict';

	/**
	 * Converts an object into (and back from) the compressed representation
	 * used on a DynamoDB record.
	 *
	 * @public
	 * @extends {DelegateSerializer}
	 */
	class CompressedJsonSerializer extends DelegateSerializer {
		constructor() {
			super(CompressedBinarySerializer.INSTANCE, serializeBuffer, deserializeBuffer);
		}

		/**
		 * A singleton.
		 *
		 * @public
		 * @static
		 * @returns {CompressedJsonSerializer}
		 */
		static get INSTANCE() {
			return instance;
		}

		toString() {
			return '[CompressedJsonSerializer]';
		}
	}

	function serializeBuffer(value) {
		assert.argumentIsRequired(value, 'value', Object);

		return Buffer.from(JSON.stringify(value));
	}

	function deserializeBuffer(value) {
		return JSON.parse(value.toString());
	}

	const instance = new CompressedJsonSerializer();

	return CompressedJsonSerializer;
})();