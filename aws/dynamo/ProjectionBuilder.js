const assert = require('common/lang/assert'),
	is = require('common/lang/is');

const Attribute = require('./Attribute'),
	AttributeBuilder = require('./AttributeBuilder'),
	Projection = require('./Projection'),
	ProjectionType = require('./ProjectionType');

module.exports = (() => {
	'use strict';

	class ProjectionBuilder {
		constructor(type) {
			assert.argumentIsRequired(type, 'type', ProjectionType, 'ProjectionType');

			this._projection = new Projection(type, [ ]);
		}

		get projection() {
			return this._projection;
		}

		withAttribute(name, dataType) {
			const attributeBuilder = new AttributeBuilder(name)
				.withDataType(dataType);

			return this.withAttributeBuilder(attributeBuilder);
		}

		withAttributeBuilder(attributeBuilder) {
			assert.argumentIsRequired(attributeBuilder, 'attributeBuilder', AttributeBuilder, 'AttributeBuilder');

			const attribute = attributeBuilder.attribute;
			const attributes = this._projection.attributes.filter(a => a.name !== attribute.name).concat(attribute);

			this._projection = new Projection(this._projection.type, attributes);

			return this;
		}

		static withType(type) {
			return new ProjectionBuilder(type);
		}

		toString() {
			return '[ProjectionBuilder]';
		}
	}

	return ProjectionBuilder;
})();