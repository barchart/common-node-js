const array = require('common/lang/array'),
	assert = require('common/lang/assert'),
	is = require('common/lang/is');

const Attribute = require('./Attribute'),
	ProjectionType = require('./ProjectionType');

module.exports = (() => {
	'use strict';

	class Projection {
		constructor(type, attributes) {
			this._type = type;
			this._attributes = attributes || [ ];
		}

		get type() {
			return this._type;
		}

		get attributes() {
			return [...this._attributes];
		}

		validate() {
			if (!(this._type instanceof ProjectionType)) {
				throw new Error('Projection type is invalid.');
			}

			if (!is.array(this._attributes)) {
				throw new Error('Projection must have an array of attributes.');
			}

			if (!this._attributes.every(a => a instanceof Attribute)) {
				throw new Error('Projection attributes array can only contain attribute instances).');
			}

			if (!array.uniqueBy(this._attributes, a => a.name)) {
				throw new Error('Projection attributes must be unique.');
			}

			if (this._type === ProjectionType.CUSTOM && this._attributes.length === 0) {
				throw new Error('Projection (custom) must have at least one attribute.');
			}

			if (this._type === ProjectionType.KEYS && this._attributes.length !== 0) {
				throw new Error('Projection (keys) cannot define any attributes.');
			}

			if (this._type === ProjectionType.ALL && this._attributes.length !== 0) {
				throw new Error('Projection (all) cannot define any attributes.');
			}

			this._attributes.forEach(a => a.validate());
		}

		toProjectionSchema() {
			this.validate();

			const schema = {
				ProjectionType: this._type.code
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