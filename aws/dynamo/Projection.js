const array = require('common/lang/array'),
	assert = require('common/lang/assert'),
	is = require('common/lang/is');

const Attribute = require('./Attribute'),
	ProjectionType = require('./ProjectionType');

module.exports = (() => {
	'use strict';

	class Projection {
		constructor(projectionType, attributes) {
			this._projectionType = projectionType;
			this._attributes = attributes || [ ];
		}

		get projectionType() {
			return this._projectionType;
		}

		get attributes() {
			return [...this._attributes];
		}

		validate() {
			if (!(this._projectionType instanceof ProjectionType)) {
				throw new Error('Projection type is invalid.');
			}

			if (!is.array(this._attributes)) {
				throw new Error('Projection must have an array of attributes.');
			}

			if (!this._attributes.every(a => a instanceof Attribute)) {
				throw new Error('Projection attributes array can only contain Attribute instances.');
			}

			if (!array.unique(this._attributes.map(a => a.attribute.name))) {
				throw new Error('Projection attribute names must be unique (only one attribute with a given name).');
			}

			if (this._projectionType === ProjectionType.CUSTOM && this._attributes.length === 0) {
				throw new Error('Projection (custom) must have at least one attribute.');
			}

			if (this._projectionType === ProjectionType.KEYS && this._attributes.length !== 0) {
				throw new Error('Projection (keys) cannot define any attributes.');
			}

			if (this._projectionType === ProjectionType.ALL && this._attributes.length !== 0) {
				throw new Error('Projection (all) cannot define any attributes.');
			}

			this._attributes.forEach(a => a.validate());
		}

		toProjectionSchema() {
			this.validate();

			const schema = {
				ProjectionType: this._projectionType.code
			};

			if (this._attributes.length > 0) {
				schema.NonKeyAttributes = this._attributes.map(a => a.name);
			}

			return schema;
		}

		toString() {
			return '[Projection]';
		}
	}

	return Projection;
})();