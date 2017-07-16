const assert = require('common/lang/assert'),
	is = require('common/lang/is');

const ProvisionedThroughputBuilder = require('./ProvisionedThroughputBuilder'),
	KeyBuilder = require('./KeyBuilder'),
	KeyType = require('./KeyType');

module.exports = (() => {
	'use strict';

	class TableBuilder {
		constructor(name) {
			assert.argumentIsRequired(name, 'name', String);

			this._name = name;

			this._keyBuilders = [ ];
			this._indexBuilders = [ ];

			this._provisionedThroughputBuilder = ProvisionedThroughputBuilder.fromDefaults();
		}

		withKey(name, dataType, keyType) {
			const keyBuilder = KeyBuilder.withName(name)
				.withDataType(dataType)
				.withKeyType(keyType);

			return this.withKeyBuilder(keyBuilder);
		}

		withKeyBuilder(keyBuilder) {
			assert.argumentIsRequired(keyBuilder, 'keyBuilder', KeyBuilder, 'KeyBuilder');

			if (this._keyBuilders.some(k => k.name === proposed.name)) {
				throw new Error(`Unable to add key, another key definition exists for the same [${proposed.name}]`);
			}

			if (this._keyBuilders.some(k => k.keyType === proposed.keyType)) {
				throw new Error(`Unable to add key, another key definition exists for the same key type [${proposed.keyType.code}]`);
			}

			this._keyBuilders.push(keyBuilder);

			return this;
		}

		withProvisionedThroughput(readUnits, writeUnits) {
			const provisionedThroughputBuilder = new ProvisionedThroughputBuilder(readUnits, writeUnits);

			return this.withProvisionedThroughputBuilder(provisionedThroughputBuilder);
		}

		withProvisionedThroughputBuilder(provisionedThroughputBuilder) {
			assert.argumentIsRequired(provisionedThroughputBuilder, 'provisionedThroughputBuilder', ProvisionedThroughputBuilder, 'ProvisionedThroughputBuilder');

			this._provisionedThroughputBuilder = provisionedThroughputBuilder;

			return this;
		}

		validate() {
			if (!is.string(this._name) || this._name.length < 1) {
				throw new Error('Table name is invalid.');
			}

			if (this._keyBuilders.filter(k => k.keyType === KeyType.HASH).length !== 1) {
				throw new Error('Table must have at least one hash key.');
			}

			this._keyBuilders.forEach((kb) => kb.validate());

			this._provisionedThroughputBuilder.validate();
		}

		toTableSchema() {
			this.validate();

			const schema = {
				TableName: this._name
			};

			schema.AttributeDefinitions = this._keyBuilders.map(kb => kb.toAttributeSchema());
			schema.KeySchema = this._keyBuilders.map(kb => kb.toKeySchema());
			schema.ProvisionedThroughput = this._provisionedThroughputBuilder.toProvisionedThroughputSchema();

			return schema;
		}

		static withName(name) {
			return new TableBuilder(name);
		}

		toString() {
			return '[TableBuilder]';
		}
	}

	return TableBuilder;
})();