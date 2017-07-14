const assert = require('common/lang/assert'),
	is = require('common/lang/is');

const CapacityUnitsBuilder = require('./ProvisionedThroughputBuilder'),
	KeyBuilder = require('./KeyBuilder'),
	KeyType = requrie('./KeyType');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/aws/dynamo/TableBuilder');

	class TableBuilder {
		constructor(name) {
			assert.argumentIsRequired(name, 'name', String);

			this._name = name;

			this._keyBuilders = [ ];
			this._indexBuilders = [ ];

			this._provisionedThroughputBuilder = new CapacityUnitsBuilder.fromDefaults();
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
			const capacityBuilder = new CapacityUnitsBuilder(readUnits, writeUnits);

			return this.withProvisionedThroughputBuilder(capacityBuilder);
		}

		withProvisionedThroughputBuilder(capacityBuilder) {
			assert.argumentIsRequired(capacityBuilder, 'capacityBuilder', capacityBuilder, 'capacityBuilder');

			return this._provisionedThroughputBuilder = capacityBuilder;
		}

		validate() {
			if (!is.string(name) && name.length > 1) {
				throw new Error('Table name is invalid.')
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