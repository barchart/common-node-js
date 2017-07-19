const assert = require('common/lang/assert'),
	is = require('common/lang/is');

const Attribute = require('./Attribute'),
	KeyType = require('./KeyType');

module.exports = (() => {
	'use strict';

	class Key {
		constructor(attribute, keyType) {
			this._attribute = attribute;
			this._keyType = keyType;
		}

		get attribute() {
			return this._attribute;
		}

		get keyType() {
			return this._keyType;
		}

		validate() {
			if (!(this._attribute instanceof Attribute)) {
				throw new Error('Key attribute is invalid.');
			}

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
			return `[Key (name=${this._attribute.name}, type=${this._keyType.code})]`;
		}
	}

	return Key;
})();