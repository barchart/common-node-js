const assert = require('common/lang/assert'),
	is = require('common/lang/is');

const Attribute = require('./Attribute'),
	DataType = require('./DataType'),
	Key = require('./Key'),
	KeyType = require('./KeyType');

module.exports = (() => {
	'use strict';

	class Key {
		constructor(name, dataType, keyType) {
			this._attribute = new Attribute(name, dataType);
			this._keyType = keyType;
		}

		get attribute() {
			return this._attribute;
		}

		get keyType() {
			return this._keyType;
		}

		validate() {
			if (!(this._keyType instanceof KeyType)) {
				throw new Error('Key type is invalid.');
			}

			this._attribute.validate();
		}

		toKeySchema() {
			this.validate();

			return {
				AttributeName: this._attribute.name,
				KeyType: this._keyType.code
			};
		}

		toString() {
			return '[Key]';
		}
	}

	return Key;
})();