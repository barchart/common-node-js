const zlib = require('zlib');

const assert = require('@barchart/common-js/lang/assert'),
	is = require('@barchart/common-js/lang/is');

const BinarySerializer = require('./BinarySerializer')

module.exports = (() => {
	'use strict';

	/**
	 * Converts a buffer into (and back from) the representation used
	 * on a DynamoDB record, using compression.
	 *
	 * @public
	 * @extends {AttributeSerializer}
	 */
	class CompressedBinarySerializer extends BinarySerializer {
		constructor() {
			super();
		}

		_getUseCompression() {
			return true;
		}

		/**
		 * A singleton.
		 *
		 * @public
		 * @static
		 * @returns {CompressedBinarySerializer}
		 */
		static get INSTANCE() {
			return instance;
		}

		toString() {
			return '[CompressedBinarySerializer]';
		}
	}

	const instance = new CompressedBinarySerializer();

	return CompressedBinarySerializer;
})();