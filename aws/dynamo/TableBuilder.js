const assert = require('common/lang/assert'),
	is = require('common/lang/is');

const DataType = require('./DataType'),
	IndexBuilder = require('./IndexBuilder'),
	IndexType = require('./IndexType'),
	KeyBuilder = require('./KeyBuilder'),
	KeyType = require('./KeyType'),
	ProjectionBuilder = require('./ProjectionBuilder'),
	ProjectionType = require('./ProjectionType'),
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

		withIndexBuilder(indexBuilder) {
			assert.argumentIsRequired(indexBuilder, 'indexBuilder', IndexBuilder, 'IndexBuilder');

			const index = indexBuilder.index;
			const indicies = this._table._indices.filter(i => i.name !== index.name).concat(index);

			this._table = new Table(this._table.name, this._table.keys, indicies, this._table.provisionedThroughput);

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
			const getDataTypeForAttribute = (attributeName) => {
				return DataType.fromCode(definition.AttributeDefinitions.find(ad => ad.AttributeName === attributeName).AttributeType);
			};

			const getIndexBuilder = (indexDefinition, indexType) => {
				let indexBuilder = new IndexBuilder(indexDefinition.IndexName)
					.withType(indexType);

				indexDefinition.KeySchema.forEach((ks) => {
					indexBuilder = indexBuilder.withKey(ks.AttributeName, getDataTypeForAttribute(ks.AttributeName), KeyType.fromCode(ks.KeyType));
				});

				let projectionBuilder = ProjectionBuilder.withType(ProjectionType.fromCode(indexDefinition.Projection.ProjectionType));

				if (is.array(indexDefinition.Projection.NonKeyAttributes)) {
					indexDefinition.Projection.NonKeyAttributes.forEach((attributeName) => {
						projectionBuilder = projectionBuilder.withAttribute(attributeName, getDataTypeForAttribute(attributeName));
					});
				}

				indexBuilder = indexBuilder.withProjectionBuilder(projectionBuilder);

				if (is.object(indexDefinition.ProvisionedThroughput)) {
					indexBuilder = indexBuilder.withProvisionedThroughput(indexDefinition.ProvisionedThroughput.ReadCapacityUnits, indexDefinition.ProvisionedThroughput.WriteCapacityUnits);
				}

				return indexBuilder;
			};

			let tableBuilder = new TableBuilder(definition.TableName)
				.withProvisionedThroughput(definition.ProvisionedThroughput.ReadCapacityUnits, definition.ProvisionedThroughput.WriteCapacityUnits);

			definition.KeySchema.forEach((ks) => {
				tableBuilder = tableBuilder.withKey(ks.AttributeName, getDataTypeForAttribute(ks.AttributeName), KeyType.fromCode(ks.KeyType));
			});

			if (is.array(definition.GlobalSecondaryIndexes)) {
				definition.GlobalSecondaryIndexes.forEach((gsi) => {
					tableBuilder = tableBuilder.withIndexBuilder(getIndexBuilder(gsi, IndexType.GLOBAL_SECONDARY));
				});
			}

			if (is.array(definition.LocalSecondaryIndexes)) {
				definition.LocalSecondaryIndexes.forEach((lsi) => {
					tableBuilder = tableBuilder.withIndexBuilder(getIndexBuilder(lsi, IndexType.LOCAL_SECONDARY));
				});
			}

			return tableBuilder.table;
		}

		toString() {
			return '[TableBuilder]';
		}
	}

	return TableBuilder;
})();