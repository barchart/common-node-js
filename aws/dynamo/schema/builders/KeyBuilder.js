const assert = require('common/lang/assert'),
	is = require('common/lang/is');

const DataType = require('./DataType'),
	Key = require('./Key'),
	KeyType = require('./KeyType');

module.exports = (() => {
	'use strict';

	class KeyBuilder {
		constructor(name) {
			assert.argumentIsRequired(name, 'name', String);

			this._key = new Key(name, null, null);
		}

		get key() {
			return this._key;
		}

		withKeyType(keyType) {
			assert.argumentIsRequired(keyType, 'keyType', KeyType, 'KeyType');

			this._key = new Key(this._key.attribute.name, this._key.attribute.dataType, keyType);

			return this;
		}

		withDataType(dataType) {
			assert.argumentIsRequired(dataType, 'dataType', DataType, 'DataType');

			this._key = new Key(this._key.attribute.name, dataType, this._key.keyType);

			return this;
		}

		static withName(name) {
			return new KeyBuilder(name);
		}

		toString() {
			return '[KeyBuilder]';
		}
	}

	return KeyBuilder;
})();