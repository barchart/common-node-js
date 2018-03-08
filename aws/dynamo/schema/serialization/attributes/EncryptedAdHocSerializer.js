const assert = require('@barchart/common-js/lang/assert');

const CompressedAdHocSerializer = require('./CompressedAdHocSerializer');

module.exports = (() => {
	'use strict';

	/**
	 * Converts an {@link AdHoc} instance into (and back from) the compressed
	 * and encrypted representation used on a DynamoDB record.
	 *
	 * @public
	 * @extends {CompressedAdHocSerializer}
	 */
	class EncryptedAdHocSerializer extends CompressedAdHocSerializer {
		constructor(attribute) {
			super(attribute);
		}

		_getEncryptor() {
			return this._getAttribute().encryptor;
		}

		toString() {
			return '[EncryptedAdHocSerializer]';
		}
	}

	return EncryptedAdHocSerializer;
})();