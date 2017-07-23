const assert = require('common/lang/assert');

const Index = require('./../definitions/Index'),
	IndexType = require('./../definitions/IndexType'),
	Projection = require('./../definitions/Projection'),
	ProjectionType = require('./../definitions/ProjectionType');

const KeyBuilder = require('./KeyBuilder'),
	ProjectionBuilder = require('./ProjectionBuilder'),
	ProvisionedThroughputBuilder = require('./ProvisionedThroughputBuilder');

module.exports = (() => {
	'use strict';

	/**
	 * Fluent interface for building an {@link Index}.
	 *
	 * @public
	 */
	class IndexBuilder {
		constructor(name, parent) {
			assert.argumentIsRequired(name, 'name', String);

			this._index = new Index(name, null, [ ], null, null);
			this._parent = parent;
		}

		/**
		 * The {@link Index}, given all the information provided thus far.
		 *
		 * @public
		 */
		get index() {
			return this._index;
		}

		withType(type) {
			assert.argumentIsRequired(type, 'type', IndexType, 'IndexType');

			this._index = new Index(this._index.name, type, this._index.keys, this._index.projection, this._index.provisionedThroughput);

			return this;
		}

		withKey(name, keyType) {
			return this.withKeyBuilder(name, kb => kb.withKeyType(keyType));
		}

		withKeyBuilder(name, callback) {
			assert.argumentIsRequired(callback, 'callback', Function);

			const keyBuilder = new KeyBuilder(name, this._parent);

			callback(keyBuilder);

			return addKeyBuilder.call(this, keyBuilder);
		}

		withProjection(type, names) {
			const namesToUse = names || [ ];

			return this.withKeyBuilder(type, pb => namesToUse.forEach(n => pb.withAttribute(n)));
		}

		withProjectionBuilder(type, callback) {
			assert.argumentIsRequired(callback, 'callback', Function);

			const projectionBuilder = new ProjectionBuilder(type, this._parent);

			callback(projectionBuilder);

			return addProjectionBuilder.call(this, projectionBuilder);
		}

		withProvisionedThroughput(readUnits, writeUnits) {
			const provisionedThroughputBuilder = new ProvisionedThroughputBuilder(readUnits, writeUnits);

			return this.withProvisionedThroughputBuilder(provisionedThroughputBuilder);
		}

		withProvisionedThroughputBuilder(provisionedThroughputBuilder) {
			assert.argumentIsRequired(provisionedThroughputBuilder, 'provisionedThroughputBuilder', ProvisionedThroughputBuilder, 'ProvisionedThroughputBuilder');

			this._index = new Index(this._index.name, this._index.type, this._index.keys, this._index.projection, provisionedThroughputBuilder.provisionedThroughput);

			return this;
		}

		toString() {
			return '[IndexBuilder]';
		}
	}

	function addKeyBuilder(keyBuilder) {
		const key = keyBuilder.key;
		const keys = this._index.keys.filter(k => k.attribute.name !== key.attribute.name).concat(key);

		this._index = new Index(this._index.name, this._index.type, keys, this._index.projection, this._index.provisionedThroughput);

		return this;
	}

	function addProjectionBuilder(projectionBuilder) {
		this._index = new Index(this._index.name, this._index.type, this._index.keys, projectionBuilder.projection, this._index.provisionedThroughput);

		return this;
	}

	return IndexBuilder;
})();