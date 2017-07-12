const assert = require('common/lang/assert');

const DataType = require('./DataType'),
	KeyType = require('./KeyType');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/aws/dynamo/KeyBuilder');

	class KeyBuilder {
		constructor(name) {
			assert.argumentIsRequired(name, 'name', String);

			this._name = name;
			this._keyType = null;
			this._dataType = null;
		}

		withKeyType(keyType) {
			assert.argumentIsRequired(keyType, 'keyType', KeyType, 'KeyType');

			this._keyType = keyType;

			return this;
		}

		withDataType(keyType) {
			assert.argumentIsRequired(keyType, 'keyType', KeyType, 'KeyType');

			this._dataType = dataType;

			return this;
		}

		get name() {
			return this._name;
		}

		get keyType() {
			return this._keyType;
		}

		get dataType() {
			return this._dataType;
		}

		getIsValid() {
			return is.string(this._name) && this._keyType instanceof KeyType && this._dataType instanceof DataType;
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