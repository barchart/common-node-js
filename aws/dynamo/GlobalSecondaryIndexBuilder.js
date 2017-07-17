const assert = require('common/lang/assert'),
	is = require('common/lang/is');

const Attribute = require('./Attribute'),
	KeyBuilder = require('./KeyBuilder'),
	GlobalSecondaryIndex = require('./GlobalSecondaryIndex'),
	Projection = require('./Projection'),
	ProjectionBuilder = require('./ProjectionBuilder'),
	ProjectionType = require('./ProjectionType'),
	ProvisionedThroughput = require('./ProvisionedThroughput'),
	ProvisionedThroughputBuilder = require('./ProvisionedThroughputBuilder');

module.exports = (() => {
	'use strict';

	class GlobalSecondaryIndexBuilder {
		constructor(name) {
			assert.argumentIsRequired(name, 'name', String);

			this._index = new GlobalSecondaryIndex(name, [ ], null);
		}

		get index() {
			return this._index;
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
			const keys = this._index.keys.filter(k => k.name !== key.name).concat(key);

			this._index = new GlobalSecondaryIndex(this._index.name, keys, this._index.projection, this._index.provisionedThroughput);

			return this;
		}

		withProjection(type, attributes) {
			assert.argumentIsRequired(type, 'type', ProjectionType, 'ProjectionType');
			assert.argumentIsArray(attributes, 'attributes', Attribute, 'Attribute');

			let projectionBuilder = ProjectionBuilder.withType(type);

			attributes.forEach((a) => {
				projectionBuilder = projectionBuilder.withAttribute(a.name, a.dataType);
			});

			return this.withProjectionBuilder(projectionBuilder);
		}

		withProjectionBuilder(projectionBuilder) {
			assert.argumentIsRequired(projectionBuilder, 'projectionBuilder', ProjectionBuilder, 'ProjectionBuilder');

			this._index = new GlobalSecondaryIndex(this._index.name, this._index.keys, projectionBuilder.projection, this._index.provisionedThroughput);

			return this;
		}

		withProvisionedThroughput(readUnits, writeUnits) {
			const provisionedThroughputBuilder = new ProvisionedThroughputBuilder(readUnits, writeUnits);

			return this.withProvisionedThroughputBuilder(provisionedThroughputBuilder);
		}

		withProvisionedThroughputBuilder(provisionedThroughputBuilder) {
			assert.argumentIsRequired(provisionedThroughputBuilder, 'provisionedThroughputBuilder', ProvisionedThroughputBuilder, 'ProvisionedThroughputBuilder');

			this._index = new GlobalSecondaryIndex(this._index.name, this._index.keys, this._index.projection, provisionedThroughputBuilder.provisionedThroughput);

			return this;
		}

		static withName(name) {
			return new GlobalSecondaryIndexBuilder(name);
		}

		toString() {
			return '[GlobalSecondaryIndexBuilder]';
		}
	}

	return GlobalSecondaryIndexBuilder;
})();