const assert = require('common/lang/assert'),
	is = require('common/lang/is');

const Attribute = require('./Attribute'),
	Index = require('./Index'),
	IndexType = require('./IndexType'),
	KeyBuilder = require('./KeyBuilder'),
	Projection = require('./Projection'),
	ProjectionBuilder = require('./ProjectionBuilder'),
	ProjectionType = require('./ProjectionType'),
	ProvisionedThroughputBuilder = require('./ProvisionedThroughputBuilder');

module.exports = (() => {
	'use strict';

	class IndexBuilder {
		constructor(name) {
			assert.argumentIsRequired(name, 'name', String);

			this._index = new Index(name, null, [ ], null, null);
		}

		get index() {
			return this._index;
		}

		withType(type) {
			assert.argumentIsRequired(type, 'type', IndexType, 'IndexType');

			this._index = new Index(this._index.name, type, this._index.keys, this._index.projection, this._index.provisionedThroughput);

			return this;
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
			const keys = this._index.keys.filter(k => k.attribute.name !== key.attribute.name).concat(key);

			this._index = new Index(this._index.name, this._index.type, keys, this._index.projection, this._index.provisionedThroughput);

			return this;
		}

		withProjection(type, attributes) {
			assert.argumentIsRequired(type, 'type', ProjectionType, 'ProjectionType');

			let projectionBuilder = ProjectionBuilder.withType(type);

			let attributesToUse = attributes || [ ];

			attributesToUse.forEach((a) => {
				projectionBuilder = projectionBuilder.withAttribute(a.name, a.dataType);
			});

			return this.withProjectionBuilder(projectionBuilder);
		}

		withProjectionBuilder(projectionBuilder) {
			assert.argumentIsRequired(projectionBuilder, 'projectionBuilder', ProjectionBuilder, 'ProjectionBuilder');

			this._index = new Index(this._index.name, this._index.type, this._index.keys, projectionBuilder.projection, this._index.provisionedThroughput);

			return this;
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

		static withName(name) {
			return new IndexBuilder(name);
		}

		toString() {
			return '[IndexBuilder]';
		}
	}

	return IndexBuilder;
})();