const zlib = require('zlib');

const assert = require('@barchart/common-js/lang/assert'),
	is = require('@barchart/common-js/lang/is');

const AttributeSerializer = require('./AttributeSerializer'),
	CompressionType = require('./../../definitions/CompressionType'),
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

		_getCompressionType() {
			return null;
		}

		serialize(value) {
			assert.argumentIsValid(value, 'value', Buffer.isBuffer, 'is buffer');

			const wrapper = { };
			const compressionType = this._getCompressionType();

			let valueToAssign;

			if (compressionType === CompressionType.DEFLATE) {
				valueToAssign = zlib.deflateSync(value);
			} else if (compressionType === CompressionType.ZIP) {
				valueToAssign = zlib.gzipSync(value);
			} else {
				valueToAssign = value;
			}

			wrapper[DataType.BINARY.code] = compress ? zlib.deflateSync(value) : value;

			return wrapper;
		}

		deserialize(wrapper) {
			const value = wrapper[DataType.BINARY.code];

			const compressionType = this._getCompressionType();

			let returnRef;

			if (compressionType === CompressionType.DEFLATE) {
				returnRef = zlib.inflateSync(value)
			} else if (compressionType === CompressionType.ZIP) {
				returnRef = zlib.gunzipSync(value);
			} else {
				returnRef = value;
			}

			return returnRef;
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