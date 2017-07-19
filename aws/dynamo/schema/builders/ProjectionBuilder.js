const assert = require('common/lang/assert');

const Attribute = require('./../definitions/Attribute'),
	Projection = require('./../definitions/Projection'),
	ProjectionType = require('./../definitions/ProjectionType');

module.exports = (() => {
	'use strict';

	class ProjectionBuilder {
		constructor(type, parent) {
			assert.argumentIsRequired(type, 'type', ProjectionType, 'ProjectionType');

			this._projection = new Projection(type, [ ]);
			this._parent = parent;
		}

		get projection() {
			return this._projection;
		}

		withAttribute(name, allowMissing) {
			assert.argumentIsRequired(name, 'name', String);

			const attribute = getAttribute(name, this._parent, allowMissing);
			const attributes = this._projection.attributes.filter(a => a.name !== attribute.name).concat(attribute);

			this._projection = new Projection(this._projection.type, attributes);

			return this;
		}

		toString() {
			return '[ProjectionBuilder]';
		}
	}

	function getAttribute(name, parent, allowMissing) {
		let attribute = parent.table.attributes.find(a => a.name === name) || null;

		if (attribute === null && allowMissing) {
			attribute = new Attribute(name, null);
		}

		return attribute;
	}

	return ProjectionBuilder;
})();