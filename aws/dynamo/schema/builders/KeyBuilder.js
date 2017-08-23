const assert = require('@barchart/common-js/lang/assert');

const Attribute = require('./../definitions/Attribute'),
	Key = require('./../definitions/Key'),
	KeyType = require('./../definitions/KeyType');

module.exports = (() => {
	'use strict';

	/**
	 * Fluent interface for building a {@link Key}.
	 *
	 * @public
	 * @param {string} name
	 * @param {TableBuilder} parent
	 */
	class KeyBuilder {
		constructor(name, parent) {
			assert.argumentIsRequired(name, 'name', String);

			this._key = new Key(getAttribute(name, parent), null);
			this._parent = parent;
		}

		/**
		 * The {@link Key}, given all the information provided thus far.
		 *
		 * @public
		 */
		get key() {
			return this._key;
		}

		/**
		 * Set the {@link KeyType} and returns the current instance.
		 *
		 * @public
		 * @param {KeyType} keyType
		 * @returns {KeyBuilder}
		 */
		withKeyType(keyType) {
			assert.argumentIsRequired(keyType, 'keyType', KeyType, 'KeyType');

			this._key = new Key(this._key.attribute, keyType);

			return this;
		}

		toString() {
			return '[KeyBuilder]';
		}
	}

	function getAttribute(name, parent) {
		return parent.table.attributes.find(a => a.name === name) || null;
	}

	return KeyBuilder;
})();