const assert = require('@barchart/common-js/lang/assert'),
	Enum = require('@barchart/common-js/lang/Enum');

module.exports = (() => {
	'use strict';

	/**
	 * Defines an encrytion algorithm that can be used to encrypt data.
	 *
	 * @public
	 * @extends {Enum}
	 * @param {String} code
	 * @param {String} description
	 */
	class EncryptionType extends Enum {
		constructor(code) {
			super(code, code);
		}

		/**
		 * AES-192.
		 *
		 * @returns {EncryptionType}
		 */
		static get AES_192() {
			return encryptionTypeAes192;
		}

		/**
		 * AES-256.
		 *
		 * @returns {EncryptionType}
		 */
		static get AES_256() {
			return encryptionTypeAes256;
		}

		toString() {
			return `[EncryptionType (code=${this.code})]`;
		}
	}

	const encryptionTypeAes192 = new EncryptionType('aes192');
	const encryptionTypeAes256 = new EncryptionType('aes256');

	return EncryptionType;
})();