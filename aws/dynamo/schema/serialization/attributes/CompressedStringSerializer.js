const assert = require('@barchart/common-js/lang/assert');

const CompressedBinarySerializer = require('./CompressedBinarySerializer'),
	DelegateSerializer = require('./DelegateSerializer');

module.exports = (() => {
	'use strict';

	/**
	 * Converts a string into (and back from) the compressed representation
	 * used on a DynamoDB record.
	 *
	 * @public
	 * @extends {DelegateSerializer}
	 */
	class CompressedStringSerializer extends DelegateSerializer {
		constructor() {
			super(CompressedBinarySerializer.INSTANCE, serializeBuffer, deserializeBuffer);
		}

		/**
		 * A singleton.
		 *
		 * @public
		 * @static
		 * @returns {CompressedStringSerializer}
		 */
		static get INSTANCE() {
			return instance;
		}

		toString() {
			return '[CompressedStringSerializer]';
		}
	}

	function serializeBuffer(value) {
		assert.argumentIsRequired(value, 'value', String);

		return Buffer.from(value);
	}

	function deserializeBuffer(value) {
		return value.toString();
	}

	const instance = new CompressedStringSerializer();

	return CompressedStringSerializer;
})();