const crypto = require('crypto'),
	zlib = require('zlib');

const assert = require('@barchart/common-js/lang/assert');

const BinarySerializer = require('./CompressedBinarySerializer'),
	DelegateSerializer = require('./DelegateSerializer');

module.exports = (() => {
	'use strict';

	/**
	 * Converts a string into (and back from) the compressed and encrypted
	 * representation used on a DynamoDB record.
	 *
	 * @public
	 * @extends {DelegateSerializer}
	 */
	class EncryptedStringSerializer extends DelegateSerializer {
		constructor(attribute) {
			super(BinarySerializer.INSTANCE, serializeBuffer, deserializeBuffer);

			this._attribute = attribute;
		}

		toString() {
			return '[EncryptedStringSerializer]';
		}
	}

	function serializeBuffer(value) {
		assert.argumentIsRequired(value, 'value', String);

		const encryptor = this._attribute.encryptor;
		const cipher = crypto.createCipher(encryptor.type.code, encryptor.password);

		const buffer = zlib.deflateSync(Buffer.from(value));

		return Buffer.concat([ cipher.update(buffer), cipher.final() ]);
	}

	function deserializeBuffer(value) {
		const encryptor = this._attribute.encryptor;
		const decipher = crypto.createDecipher(encryptor.type.code, encryptor.password);

		const decrypted = zlib.inflateSync(Buffer.concat([ decipher.update(value), decipher.final() ]));

		return decrypted.toString();
	}

	const instance = new EncryptedStringSerializer();

	return EncryptedStringSerializer;
})();