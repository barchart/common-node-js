const assert = require('common/lang/assert');

const Attribute = require('./../definitions/Attribute'),
	Key = require('./../definitions/Key'),
	KeyType = require('./../definitions/KeyType');

module.exports = (() => {
	'use strict';

	class KeyBuilder {
		constructor(name, parent) {
			assert.argumentIsRequired(name, 'name', String);

			this._key = new Key(getAttribute(name, parent), null);
			this._parent = parent;
		}

		get key() {
			return this._key;
		}

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