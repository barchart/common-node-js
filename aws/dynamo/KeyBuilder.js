const assert = require('common/lang/assert'),
	is = require('common/lang/is');

const AttributeBuilder = require('./AttributeBuilder'),
	DataType = require('./DataType'),
	KeyType = require('./KeyType');

module.exports = (() => {
	'use strict';

	class KeyBuilder {
		constructor(name) {
			assert.argumentIsRequired(name, 'name', String);

			this._attributeBuilder = AttributeBuilder.withName(name);
			this._keyType = null;
		}

		get attributeBuilder() {
			return this._attributeBuilder;
		}

		get keyType() {
			return this._keyType;
		}

		withKeyType(keyType) {
			assert.argumentIsRequired(keyType, 'keyType', KeyType, 'KeyType');

			this._keyType = keyType;

			return this;
		}

		withDataType(dataType) {
			this._attributeBuilder.withDataType(dataType);

			return this;
		}

		withAttributeBuilder(attributeBuilder) {
			assert.argumentIsRequired(attributeBuilder, 'attributeBuilder', AttributeBuilder, 'AttributeBuilder');

			this._attributeBuilder = attributeBuilder;

			return this;
		}

		validate() {
			if (!(this._keyType instanceof KeyType)) {
				throw new Error('Key type is invalid.');
			}

			this._attributeBuilder.validate();
		}

		toAttributeSchema() {
			return this._attributeBuilder.toAttributeSchema();
		}

		toKeySchema() {
			this.validate();

			return {
				AttributeName: this._attributeBuilder.name,
				KeyType: this._keyType.code
			};
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