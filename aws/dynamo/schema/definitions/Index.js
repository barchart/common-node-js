const array = require('common/lang/array'),
	assert = require('common/lang/assert'),
	is = require('common/lang/is');

const IndexType = require('./IndexType'),
	Key = require('./Key'),
	KeyType = require('./KeyType'),
	Projection = require('./Projection');

module.exports = (() => {
	'use strict';

	/**
	 * The definition for a DynamoDB index.
	 *
	 * @public
	 */
	class Index {
		constructor(name, type, keys, projection, provisionedThroughput) {
			this._name = name;
			this._type = type || null;

			this._keys = keys || [ ];

			this._projection = projection || null;
			this._provisionedThroughput = provisionedThroughput || null;
		}

		/**
		 * Name of the index.
		 *
		 * @public
		 * @returns {String}
		 */
		get name() {
			return this._name;
		}

		/**
		 * Type of the index.
		 *
		 * @public
		 * @returns {IndexType}
		 */
		get type() {
			return this._type;
		}

		/**
		 * The index's keys.
		 *
		 * @public
		 * @returns {Array<Key>}
		 */
		get keys() {
			return [...this._keys];
		}

		/**
		 * The index's {@link Projection}.
		 *
		 * @public
		 * @returns {Projection}
		 */
		get projection() {
			return this._projection;
		}

		/**
		 * The index's {@link ProvisionedThroughput}, if applicable to the {@link IndexType}.
		 *
		 * @public
		 * @returns {ProvisionedThroughput|null}
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
				throw new Error('Index name is invalid.');
			}

			if (!(this._type instanceof IndexType)) {
				throw new Error('Index type is invalid.');
			}

			if (!is.array(this._keys)) {
				throw new Error('Index must have an array of keys.');
			}

			if (!this._keys.every(k => k instanceof Key)) {
				throw new Error('Index key array can only contain Key instances.');
			}

			if (this._keys.filter(k => k.keyType === KeyType.HASH).length !== 1) {
				throw new Error('Index must have one hash key.');
			}

			if (this._keys.filter(k => k.keyType === KeyType.RANGE).length > 1) {
				throw new Error('Table must not have more than one range key.');
			}

			if (!array.unique(this._keys.map(k => k.attribute.name))) {
				throw new Error('Index key names must be unique (only one key with a given name).');
			}

			if (!(this._projection instanceof Projection)) {
				throw new Error('Index must have a projection definition.');
			}

			this._projection.validate();

			if (this._type.separateProvisioning) {
				this._provisionedThroughput.validate();
			} else if (this._provisionedThroughput !== null) {
				throw new Error('Index type does not require separate throughput provisioning');
			}
		}

		/**
		 * Generates an object which is suitable for use by the AWS SDK.
		 *
		 * @public
		 * @returns {Object}
		 */
		toIndexSchema() {
			this.validate();

			const schema = {
				IndexName: this._name
			};

			schema.KeySchema = this._keys.map(k => k.toKeySchema());
			schema.Projection = this._projection.toProjectionSchema();

			if (this.type.separateProvisioning) {
				schema.ProvisionedThroughput = this._provisionedThroughput.toProvisionedThroughputSchema();
			}

			return schema;
		}

		toString() {
			return `[Index (name=${this._name})]`;
		}
	}

	return Index;
})();