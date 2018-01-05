const zlib = require('zlib');

const assert = require('@barchart/common-js/lang/assert'),
	is = require('@barchart/common-js/lang/is');

const AttributeSerializer = require('./AttributeSerializer'),
	DataType = require('./../../definitions/DataType');

module.exports = (() => {
	'use strict';

	/**
	 * Converts a buffer into (and back from) the representation used
	 * on a DynamoDB record.
	 *
	 * @public
	 * @extends {AttributeSerializer}
	 */
	class BinarySerializer extends AttributeSerializer {
		constructor() {
			super();
		}

		_getUseCompression() {
			return false;
		}

		serialize(value) {
			assert.argumentIsValid(value, 'value', Buffer.isBuffer, 'is buffer');

			const wrapper = { };
			const compress = this._getUseCompression();

			wrapper[DataType.BINARY.code] = compress ? zlib.deflateSync(value) : value;

			return wrapper;
		}

		deserialize(wrapper) {
			const value = wrapper[DataType.BINARY.code];
			const compress = this._getUseCompression();

			return compress ? zlib.inflateSync(value) : value;
		}

		/**
		 * A singleton.
		 *
		 * @public
		 * @static
		 * @returns {BinarySerializer}
		 */
		static get INSTANCE() {
			return instance;
		}

		toString() {
			return '[BinarySerializer]';
		}
	}

	const instance = new BinarySerializer();

	return BinarySerializer;
})();