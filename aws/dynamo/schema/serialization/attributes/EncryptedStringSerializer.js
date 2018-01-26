const assert = require('@barchart/common-js/lang/assert');

const CompressedStringSerializer = require('./CompressedStringSerializer');

module.exports = (() => {
	'use strict';

	/**
	 * Converts a string into (and back from) the compressed and encrypted
	 * representation used on a DynamoDB record.
	 *
	 * @public
	 * @extends {CompressedStringSerializer}
	 */
	class EncryptedStringSerializer extends CompressedStringSerializer {
		constructor(attribute) {
			super(attribute);
		}

		_getEncryptor() {
			return this._getAttribute().encryptor;
		}

		toString() {
			return '[EncryptedStringSerializer]';
		}
	}

	return EncryptedStringSerializer;
})();