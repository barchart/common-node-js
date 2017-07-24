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

	/**
	 * Fluent interface for building a {@link Table}.
	 *
	 * @public
	 */
	class TableBuilder {
		/**
		 * @param {String} name - Name of the table.
		 */
		constructor(name) {
			assert.argumentIsRequired(name, 'name', String);

			this._table = new Table(name, [ ], [ ], [ ], null);
		}

		/**
		 * The {@link Table}, given all the information provided thus far.
		 *
		 * @public
		 */
		get table() {
			return this._table;
		}

		/**
		 * Adds an {@link Attribute} and returns the current instance.
		 *
		 * @public
		 * @param {String} attributeName
		 * @param {DataType} dataType
		 * @returns {TableBuilder}
		 */
		withAttribute(attributeName, dataType) {
			return this.withAttributeBuilder(attributeName, ab => ab.withDataType(dataType));
		}

		/**
		 * Adds an {@link Attribute} to the filter, using a callback that
		 * provides the consumer with an {@AttributeBuilder}, then returns
		 * the current instance.
		 *
		 * @public
		 * @param {Attribute} attributeName
		 * @param {Function} callback - Synchronously called, providing a {@link AttributeBuilder} tied to the current instance.
		 * @returns {TableBuilder}
		 */
		withAttributeBuilder(attributeName, callback) {
			assert.argumentIsRequired(callback, 'callback', Function);

			const attributeBuilder = new AttributeBuilder(attributeName, this);

			callback(attributeBuilder);

			return addAttributeBuilder.call(this, attributeBuilder);
		}

		/**
		 * Adds a {@link Key} and returns the current instance.
		 *
		 * @public
		 * @param {String} keyName
		 * @param {KeyType} keyType
		 * @returns {TableBuilder}
		 */
		withKey(keyName, keyType) {
			return this.withKeyBuilder(keyName, kb => kb.withKeyType(keyType));
		}

		/**
		 * Adds an {@link Key} to the filter, using a callback that
		 * provides the consumer with an {@KeyBuilder}, then returns
		 * the current instance.
		 *
		 * @public
		 * @param {String} keyName
		 * @param {Function} callback - Synchronously called, providing a {@link KeyBuilder} tied to the current instance.
		 * @returns {TableBuilder}
		 */
		withKeyBuilder(name, callback) {
			assert.argumentIsRequired(callback, 'callback', Function);

			const keyBuilder = new KeyBuilder(name, this);

			callback(keyBuilder);

			return addKeyBuilder.call(this, keyBuilder);
		}

		/**
		 * Adds an {@link Index} to the filter, using a callback that
		 * provides the consumer with an {@IndexBuilder}, then returns
		 * the current instance.
		 *
		 * @public
		 * @param {String} indexName
		 * @param {Function} callback - Synchronously called, providing a {@link IndexBuilder} tied to the current instance.
		 * @returns {TableBuilder}
		 */
		withIndexBuilder(indexName, callback) {
			assert.argumentIsRequired(callback, 'callback', Function);

			const indexBuilder = new IndexBuilder(indexName, this);

			callback(indexBuilder);

			return addIndexBuilder.call(this, indexBuilder);
		}

		/**
		 * Adds a {@link ProvisionedThroughpu} specification and returns the
		 * current instance.
		 *
		 * @public
		 * @param {Number} readUnits
		 * @param {Number} writeUnits
		 * @returns {TableBuilder}
		 */
		withProvisionedThroughput(readUnits, writeUnits) {
			return this.withProvisionedThroughputBuilder(ptb => ptb.withRead(readUnits).withWrite(writeUnits));
		}

		/**
		 * Adds an {@link ProvisionedThroughpu} specification to the
		 * filter, using a callback that provides the consumer with a
		 * {@ProvisionedThroughputBuilder}, then returns the current instance.
		 *
		 * @public
		 * @param {Function} callback - Synchronously called, providing a {@link ProvisionedThroughputBuilder} tied to the current instance.
		 * @returns {TableBuilder}
		 */
		withProvisionedThroughputBuilder(callback) {
			assert.argumentIsRequired(callback, 'callback', Function);

			const provisionedThroughputBuilder = new ProvisionedThroughputBuilder();

			callback(provisionedThroughputBuilder);

			return addProvisionedThroughputBuilder.call(this, provisionedThroughputBuilder);
		}

		/**
		 * Creates a new {@link TableBuilder}.
		 *
		 * @param {String} name - Name of the table.
		 * @returns {TableBuilder}
		 */
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