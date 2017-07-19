const assert = require('common/lang/assert'),
	is = require('common/lang/is');

const DataType = require('./../definitions/DataType'),
	IndexType = require('./../definitions/IndexType'),
	KeyType = require('./../definitions/KeyType'),
	ProjectionType = require('./../definitions/ProjectionType'),
	ProvisionedThroughput = require('./../definitions/ProvisionedThroughput'),
	Table = require('./../definitions/Table');

const AttributeBuilder = require('./AttributeBuilder'),
	IndexBuilder = require('./IndexBuilder'),
	KeyBuilder = require('./KeyBuilder'),
	ProjectionBuilder = require('./ProjectionBuilder'),
	ProvisionedThroughputBuilder = require('./ProvisionedThroughputBuilder');

module.exports = (() => {
	'use strict';

	class TableBuilder {
		constructor(name) {
			assert.argumentIsRequired(name, 'name', String);

			this._table = new Table(name, [ ], [ ], [ ], null);
		}

		get table() {
			return this._table;
		}

		withAttribute(name, dataType) {
			return this.withAttributeBuilder(name, ab => ab.withDataType(dataType));
		}

		withAttributeBuilder(name, callback) {
			assert.argumentIsRequired(callback, 'callback', Function);

			const attributeBuilder = new AttributeBuilder(name, this);

			callback(attributeBuilder);

			return addAttributeBuilder.call(this, attributeBuilder);
		}

		withKey(name, keyType) {
			return this.withKeyBuilder(name, kb => kb.withKeyType(keyType));
		}

		withKeyBuilder(name, callback) {
			assert.argumentIsRequired(callback, 'callback', Function);

			const keyBuilder = new KeyBuilder(name, this);

			callback(keyBuilder);

			return addKeyBuilder.call(this, keyBuilder);
		}

		withIndexBuilder(name, callback) {
			assert.argumentIsRequired(callback, 'callback', Function);

			const indexBuilder = new IndexBuilder(name, this);

			callback(indexBuilder);

			return addIndexBuilder.call(this, indexBuilder);
		}

		withProvisionedThroughput(readUnits, writeUnits) {
			return this.withProvisionedThroughputBuilder(ptb => ptb.withRead(readUnits).withWrite(writeUnits));
		}

		withProvisionedThroughputBuilder(callback) {
			assert.argumentIsRequired(callback, 'callback', Function);

			const provisionedThroughputBuilder = new ProvisionedThroughputBuilder();

			callback(provisionedThroughputBuilder);

			return addProvisionedThroughputBuilder.call(this, provisionedThroughputBuilder);
		}

		static withName(name) {
			return new TableBuilder(name);
		}

		static fromDefinition(definition) {
			let tableBuilder = TableBuilder.withName(definition.TableName)
				.withProvisionedThroughput(definition.ProvisionedThroughput.ReadCapacityUnits, definition.ProvisionedThroughput.WriteCapacityUnits);

			definition.AttributeDefinitions.reduce((tb, ad) => tb.withAttribute(ad.AttributeName, DataType.fromCode(ad.AttributeType)), tableBuilder);
			definition.KeySchema.reduce((tb, ks) => tb.withKey(ks.AttributeName, KeyType.fromCode(ks.KeyType)), tableBuilder);

			const processIndex = (indexType, indexDefinition) => {
				return tableBuilder.withIndexBuilder(indexDefinition.IndexName, (indexBuilder) => {
					indexDefinition.KeySchema.reduce((ib, ks) => ib.withKey(ks.AttributeName, KeyType.fromCode(ks.KeyType)), indexBuilder);

					indexBuilder.withType(indexType)
						.withProjectionBuilder(ProjectionType.fromCode(indexDefinition.Projection.ProjectionType), (projectionBuilder) => {
							if (is.array(indexDefinition.Projection.NonKeyAttributes)) {
								indexDefinition.Projection.NonKeyAttributes.reduce((pb, nka) => pb.withAttribute(nka, true), projectionBuilder);
							}
						});
				});
			};

			if (is.array(definition.LocalSecondaryIndexes)) {
				definition.LocalSecondaryIndexes.reduce((tb, lsi) => processIndex(IndexType.LOCAL_SECONDARY, lsi), tableBuilder);
			}

			if (is.array(definition.GlobalSecondaryIndexes)) {
				definition.GlobalSecondaryIndexes.reduce((tb, gsi) => processIndex(IndexType.GLOBAL_SECONDARY, gsi), tableBuilder);
			}

			return tableBuilder.table;
		}

		toString() {
			return '[TableBuilder]';
		}
	}

	function addAttributeBuilder(attributeBuilder) {
		const attribute = attributeBuilder.attribute;
		const attributes = this._table.attributes.filter(a => a.name !== attribute.name).concat(attribute);

		this._table = new Table(this._table.name, this._table.keys, this._table.indicies, attributes, this._table.provisionedThroughput);

		return this;
	}

	function addKeyBuilder(keyBuilder) {
		const key = keyBuilder.key;
		const keys = this._table.keys.filter(k => k.attribute.name !== key.attribute.name).concat(key);

		this._table = new Table(this._table.name, keys, this._table.indicies, this._table.attributes, this._table.provisionedThroughput);

		return this;
	}

	function addIndexBuilder(indexBuilder) {
		const index = indexBuilder.index;
		const indicies = this._table._indices.filter(i => i.name !== index.name).concat(index);

		this._table = new Table(this._table.name, this._table.keys, indicies, this._table.attributes, this._table.provisionedThroughput);

		return this;
	}

	function addProvisionedThroughputBuilder(provisionedThroughputBuilder) {
		this._table = new Table(this._table.name, this._table.keys, this._table.indicies, this._table.attributes, provisionedThroughputBuilder.provisionedThroughput);

		return this;
	}

	return TableBuilder;
})();