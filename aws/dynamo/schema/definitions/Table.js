const array = require('common/lang/array'),
	assert = require('common/lang/assert'),
	is = require('common/lang/is');

const Attribute = require('./Attribute'),
	Key = require('./Key'),
	KeyType = require('./KeyType'),
	Index = require('./Index'),
	IndexType = require('./IndexType');

module.exports = (() => {
	'use strict';

	/**
	 * The schema for a DynamoDB table, including attributes, keys, indicies, etc.
	 *
	 * @public
	 */
	class Table {
		constructor(name, keys, indicies, attributes, provisionedThroughput) {
			this._name = name;

			this._keys = keys || [ ];
			this._indices = indicies || [ ];
			this._attributes = attributes || [ ];

			this._provisionedThroughput = provisionedThroughput;
		}

		/**
		 * Name of the table.
		 *
		 * @public
		 * @returns {String}
		 */
		get name() {
			return this._name;
		}

		/**
		 * The keys of the table.
		 *
		 * @public
		 * @returns {Array<Key>}
		 */
		get keys() {
			return [...this._keys];
		}

		/**
		 * The indicies of the table.
		 *
		 * @public
		 * @returns {Array<Index>}
		 */
		get indicies() {
			return [...this._indices];
		}

		/**
		 * The attributes of the table.
		 *
		 * @public
		 * @returns {Array<Attributes>}
		 */
		get attributes() {
			return [...this._attributes];
		}

		/**
		 * The provisioned throughput of the table
		 *
		 * @public
		 * @returns {Array<ProvisionedThroughput>}
		 */
		get provisionedThroughput() {
			return this._provisionedThroughput;
		}

		/**
		 * Throws an {@link Error} if the instance is invalid.
		 *
		 * @public
		 */
		validate() {
			if (!is.string(this._name) || this._name.length < 1) {
				throw new Error('Table name is invalid.');
			}

			if (!is.array(this._keys)) {
				throw new Error('Table must have an array of keys.');
			}

			if (!this._keys.every(k => k instanceof Key)) {
				throw new Error('Table key array can only contain Key instances.');
			}

			if (this._keys.filter(k => k.keyType === KeyType.HASH).length !== 1) {
				throw new Error('Table must have one hash key.');
			}

			if (this._keys.filter(k => k.keyType === KeyType.RANGE).length > 1) {
				throw new Error('Table must not have more than one range key.');
			}

			if (!array.unique(this._keys.map(k => k.attribute.name))) {
				throw new Error('Table key names must be unique (only one key with a given name).');
			}

			if (!is.array(this._indices)) {
				throw new Error('Table must have an array of indicies.');
			}

			if (!this._indices.every(i => i instanceof Index)) {
				throw new Error('Table indicies array can only contain Index instances.');
			}

			if (!array.unique(this._indices.map(i => i.name))) {
				throw new Error('Table index names must be unique (only one index with a given name).');
			}

			this._keys.forEach(k => k.validate());
			this._indices.forEach(i => i.validate());

			this._provisionedThroughput.validate();
		}

		/**
		 * Generates an object which is suitable for use by the AWS SDK.
		 *
		 * @public
		 * @returns {Object}
		 */
		toTableSchema() {
			this.validate();

			const schema = {
				TableName: this._name
			};

			schema.KeySchema = this._keys.map(k => k.toKeySchema());
			schema.ProvisionedThroughput = this._provisionedThroughput.toProvisionedThroughputSchema();

			const globalIndicies = this._indices.filter(i => i.type === IndexType.GLOBAL_SECONDARY);
			const localIndicies = this._indices.filter(i => i.type === IndexType.LOCAL_SECONDARY);

			if (globalIndicies.length !== 0) {
				schema.GlobalSecondaryIndexes = globalIndicies.map(i => i.toIndexSchema());
			}

			if (localIndicies.length !== 0) {
				schema.LocalSecondaryIndexes = localIndicies.map(i => i.toIndexSchema());
			}

			let keys = array.uniqueBy(array.flatten(this._indices.map(i => i.keys)).concat([...this._keys]), k => k.attribute.name);

			schema.AttributeDefinitions = keys.map(k => k.attribute.toAttributeSchema());

			return schema;
		}

		toString() {
			return `[Table (name=${this._name})]`;
		}
	}

	return Table;
})();