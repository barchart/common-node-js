const assert = require('common/lang/assert'),
	is = require('common/lang/is');

const KeyBuilder = require('./KeyBuilder'),
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
			const keys = this._table.keys.filter(k => k.name !== key.name).concat(key);

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

		toString() {
			return '[TableBuilder]';
		}
	}

	return TableBuilder;
})();