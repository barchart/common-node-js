const array = require('@barchart/common-js/lang/array'),
	assert = require('@barchart/common-js/lang/assert'),
	is = require('@barchart/common-js/lang/is');

const EncryptionType = require('./EncryptionType');

module.exports = (() => {
	'use strict';

	/**
	 * The definition an encryption scheme to use for data at rest.
	 *
	 * @public
	 * @param {EncyrptionType} type
	 * @param {String} password
	 */
	class Encryptor {
		constructor(type, password) {
			this._type = type || null;
			this._password = password || null;
		}

		/**
		 * The algorithm type.
		 *
		 * @public
		 * @returns {EncryptionType}
		 */
		get type() {
			return this._type;
		}

		/**
		 * The password.
		 *
		 * @public
		 * @returns {String}
		 */
		get password() {
			return this._password;
		}

		/**
		 * Throws an {@link Error} if the instance is invalid.
		 *
		 * @public
		 */
		validate() {
			if (!(this._type instanceof EncryptionType)) {
				throw new Error('Encryption type is invalid.');
			}

			if (!(is.string(this._password)) || this._password.length === 0) {
				throw new Error('Password is invalid.');
			}
		}

		toString() {
			return `[Encryptor]`;
		}
	}

	return Encryptor;
})();