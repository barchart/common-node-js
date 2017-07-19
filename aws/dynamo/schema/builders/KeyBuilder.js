const assert = require('common/lang/assert');

const Attribute = require('./../definitions/Attribute'),
	Key = require('./../definitions/Key'),
	KeyType = require('./../definitions/KeyType');

const TableBuilder = require('./TableBuilder');

module.exports = (() => {
	'use strict';

	class KeyBuilder {
		constructor(name, parent) {
			assert.argumentIsRequired(attribute, 'attribute', Attribute, 'Attribute');
			assert.argumentIsRequired(parent, 'parent', TableBuilder, 'TableBuilder');

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
		const attributes = parent.table.attributes.find(a => a.name === name) || null;
	}

	return KeyBuilder;
})();