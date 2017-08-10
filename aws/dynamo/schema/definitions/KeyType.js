const assert = require('common/lang/assert');

module.exports = (() => {
	'use strict';

	/**
	 * Defines a category of {@link Key}. Currently, there are two types;
	 * a "hash" key and a "range" key.
	 *
	 * @public
	 * @param {String} code
	 * @param {String} description
	 */
	class KeyType {
		constructor(code, description) {
			assert.argumentIsRequired(code, 'code', String);
			assert.argumentIsRequired(description, 'description', String);

			this._code = code;
			this._description = description;
		}

		/**
		 * The key type's unique code (used by AWS schemas).
		 *
		 * @returns {String}
		 */
		get code() {
			return this._code;
		}

		/**
		 * A description.
		 *
		 * @returns {String}
		 */
		get description() {
			return this._description;
		}

		/**
		 * A hash key.
		 *
		 * @returns {KeyType}
		 */
		static get HASH() {
			return keyTypeHash;
		}

		/**
		 * A range key.
		 *
		 * @returns {KeyType}
		 */
		static get RANGE() {
			return keyTypeRange;
		}

		/**
		 * Returns a {@link KeyType}, given its unique code.
		 *
		 * @param {String} code
		 * @returns {KeyType}
		 */
		static fromCode(code) {
			assert.argumentIsRequired(code, 'code', String);

			return keyTypes.find(kt => kt.code === code);
		}

		toString() {
			return `[KeyType (code=${this._code}, description=${this._description})]`;
		}
	}

	const keyTypeHash = new KeyType('HASH', 'Hash');
	const keyTypeRange = new KeyType('RANGE', 'Range');

	const keyTypes = [ keyTypeHash, keyTypeRange ];

	return KeyType;
})();