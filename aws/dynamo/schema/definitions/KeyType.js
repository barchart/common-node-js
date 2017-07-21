const assert = require('common/lang/assert');

module.exports = (() => {
	'use strict';

	/**
	 * Defines a category of {@link Key}. Currently, there are two types;
	 * a "hash" key and a "range" key.
	 *
	 * @public
	 */
	class KeyType {
		constructor(code, description) {
			assert.argumentIsRequired(code, 'code', String);
			assert.argumentIsRequired(description, 'description', String);

			this._code = code;
			this._description = description;
		}

		get code() {
			return this._code;
		}

		get description() {
			return this._description;
		}

		static get HASH() {
			return keyTypeHash;
		}

		static get RANGE() {
			return keyTypeRange;
		}

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