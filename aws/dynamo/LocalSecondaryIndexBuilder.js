const assert = require('common/lang/assert'),
	is = require('common/lang/is');

const Attribute = require('./Attribute'),
	KeyBuilder = require('./KeyBuilder'),
	LocalSecondaryIndex = require('./LocalSecondaryIndex'),
	Projection = require('./Projection'),
	ProjectionBuilder = require('./ProjectionBuilder'),
	ProjectionType = require('./ProjectionType');

module.exports = (() => {
	'use strict';

	class LocalSecondaryIndexBuilder {
		constructor(name) {
			assert.argumentIsRequired(name, 'name', String);

			this._index = new LocalSecondaryIndex(name, [ ], null);
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
			const keys = this._index.keys.filter(k => k.attribute.name !== key.attribute.name).concat(key);

			this._index = new LocalSecondaryIndex(this._index.name, keys, this._index.projection);

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

			this._index = new LocalSecondaryIndex(this._index.name, this._index.keys, projectionBuilder.projection);

			return this;
		}

		static withName(name) {
			return new LocalSecondaryIndexBuilder(name);
		}

		toString() {
			return '[LocalSecondaryIndexBuilder]';
		}
	}

	return LocalSecondaryIndexBuilder;
})();