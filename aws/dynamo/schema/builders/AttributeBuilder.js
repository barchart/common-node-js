const assert = require('@barchart/common-js/lang/assert');

const Attribute = require('./../definitions/Attribute'),
	DataType = require('./../definitions/DataType');

const DerivationBuilder = require('./DerivationBuilder');

module.exports = (() => {
	'use strict';

	/**
	 * Fluent interface for building an {@link Attribute}.
	 *
	 * @public
	 * @param {String} name
	 */
	class AttributeBuilder {
		constructor(name, parent) {
			assert.argumentIsRequired(name, 'name', String);

			this._attribute = new Attribute(name, null, null);
			this._parent = parent;
		}

		/**
		 * The {@link Attribute}, given all the information provided thus far.
		 *
		 * @public
		 */
		get attribute() {
			return this._attribute;
		}

		/**
		 * Set the {@link DataType} and returns the current instance.
		 *
		 * @public
		 * @param {DataType} dataType
		 * @returns {AttributeBuilder}
		 */
		withDataType(dataType) {
			assert.argumentIsRequired(dataType, 'dataType', DataType, 'DataType');

			this._attribute = new Attribute(this._attribute.name, dataType, this._attribute.derivation);

			return this;
		}

		withDerivationBuilder(callback) {
			assert.argumentIsRequired(callback, 'callback', Function);

			const derivationBuilder = new DerivationBuilder(this);

			callback(derivationBuilder);

			const derivation = derivationBuilder.derivation;

			this._attribute = new AttributeBuilder(this._attribute.name, this._attribute.dataType, derivation);

			return this;
		}

		toString() {
			return '[AttributeBuilder]';
		}
	}

	return AttributeBuilder;
})();