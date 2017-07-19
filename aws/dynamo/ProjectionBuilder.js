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

		withAttributeName(attributeName) {
			assert.argumentIsRequired(attributeName, 'attributeName', String);

			const attributes = this._projection.attributes.filter(a => a !== attributeName).concat(attributeName).sort();

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