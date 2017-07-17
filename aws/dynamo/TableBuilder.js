const assert = require('common/lang/assert'),
	is = require('common/lang/is');

const DataType = require('./DataType'),
	KeyBuilder = require('./KeyBuilder'),
	KeyType = require('./KeyType'),
	ProvisionedThroughput = require('./ProvisionedThroughput'),
	ProvisionedThroughputBuilder = require('./ProvisionedThroughputBuilder'),
	Table = require('./Table');

module.exports = (() => {
	'use strict';

	class TableBuilder {
		constructor(name) {
			assert.argumentIsRequired(name, 'name', String);

			this._table = new Table(name, [ ], [ ], ProvisionedThroughput.getDefault());
		}

		get table() {
			return this._table;
		}

		withKey(name, dataType, keyType) {
			const keyBuilder = KeyBuilder.withName(name)
				.withDataType(dataType)
				.withKeyType(keyType);

			return this.withKeyBuilder(keyBuilder);
		}

		withKeyBuilder(keyBuilder) {
			assert.argumentIsRequired(keyBuilder, 'keyBuilder', KeyBuilder, 'KeyBuilder');

			const key = keyBuilder.key;
			const keys = this._table.keys.filter(k => k.attribute.name !== key.attribute.name).concat(key);

			this._table = new Table(this._table.name, keys, this._table.indicies, this._table.provisionedThroughput);

			return this;
		}

		withProvisionedThroughput(readUnits, writeUnits) {
			const provisionedThroughputBuilder = new ProvisionedThroughputBuilder(readUnits, writeUnits);

			return this.withProvisionedThroughputBuilder(provisionedThroughputBuilder);
		}

		withProvisionedThroughputBuilder(provisionedThroughputBuilder) {
			assert.argumentIsRequired(provisionedThroughputBuilder, 'provisionedThroughputBuilder', ProvisionedThroughputBuilder, 'ProvisionedThroughputBuilder');

			this._table = new Table(this._table.name, this._table.keys, this._table.indicies, provisionedThroughputBuilder.provisionedThroughput);

			return this;
		}

		static withName(name) {
			return new TableBuilder(name);
		}

		static fromDefinition(definition) {
			let tableBuilder = new TableBuilder(definition.TableName)
				.withProvisionedThroughput(definition.ProvisionedThroughput.ReadCapacityUnits, definition.ProvisionedThroughput.WriteCapacityUnits);

			definition.KeySchema.forEach((ks) => {
				tableBuilder = tableBuilder.withKey(ks.AttributeName, DataType.fromCode(definition.AttributeDefinitions.find(ad => ad.AttributeName === ks.AttributeName).AttributeType), KeyType.fromCode(ks.KeyType));
			});

			return tableBuilder.table;
		}

		toString() {
			return '[TableBuilder]';
		}
	}

	return TableBuilder;
})();