const assert = require('common/lang/assert');

const Attribute = require('./../definitions/Attribute'),
	Projection = require('./../definitions/Projection'),
	ProjectionType = require('./../definitions/ProjectionType');

module.exports = (() => {
	'use strict';

	/**
	 * Fluent interface for building a {@link Projection}.
	 *
	 * @public
	 */
	class ProjectionBuilder {
		/**
		 * @param {ProjectionType} projectionType
		 * @param {TableBuilder} parent
		 */
		constructor(projectionType, parent) {
			assert.argumentIsRequired(type, 'type', ProjectionType, 'ProjectionType');

			this._projection = new Projection(type, [ ]);
			this._parent = parent;
		}

		/**
		 * The {@link Projection}, given all the information provided thus far.
		 *
		 * @public
		 */
		get projection() {
			return this._projection;
		}

		/**
		 * Adds an {@link Attribute} to the projection and returns current instance.
		 *
		 * @public
		 * @param {String} attributeName
		 * @param {Boolean} allowMissing
		 * @returns {ProjectionBuilder}
		 */
		withAttribute(attributeName, allowMissing) {
			assert.argumentIsRequired(attributeName, 'name', String);

			const attribute = getAttribute(attributeName, this._parent, allowMissing);
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