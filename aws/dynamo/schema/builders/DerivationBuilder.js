const assert = require('@barchart/common-js/lang/assert');

const Attribute = require('./../definitions/Attribute'),
	Derivation = require('./../definitions/Derivation');

module.exports = (() => {
	'use strict';

	/**
	 * Fluent interface for building a {@link Derivation}.
	 *
	 * @public
	 * @param {string} name
	 * @param {TableBuilder} parent
	 */
	class DerivationBuilder {
		constructor(parent) {
			assert.argumentIsRequired(name, 'name', String);

			this._derivation = null;
			this._parent = parent;
		}

		/**
		 * The {@link Derivation}, given all the information provided thus far.
		 *
		 * @public
		 */
		get derivation() {
			return this._derivation;
		}

		withAttribute(attribute) {
			const a = getAttribute(attribute, this._parent);

			let attributes;
			let generator;

			if (this._derivation) {
				attributes = this._derivation.attributes.push(a);
				generator = this._derivation.generator;
			} else {
				attributes = [ a ];
				generator = null;
			}

			this._derivation = new Derivation(attributes, generator);

			return this;
		}

		withGenerator(generator) {
			let attributes;

			if (this._derivation) {
				attributes = this._derivation.attributes;
			} else {
				attributes = null;
			}

			this._derivation = new Derivation(attributes, generator);

			return this;
		}

		toString() {
			return '[DerivationBuilder]';
		}
	}

	function getAttribute(name, parent) {
		return parent.table.attributes.find(a => a.name === name) || null;
	}

	return DerivationBuilder;
})();