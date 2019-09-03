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
			this._derivation = null;
			this._parent = parent;
		}

		/**
		 * The {@link Derivation}, given all the information provided thus far.
		 *
		 * @public
		 * @returns {Derivation}
		 */
		get derivation() {
			return this._derivation;
		}

		/**
		 * Adds an attribute whose value can be used to derive the attribute's value.
		 *
		 * @public
		 * @param {String} attribute - The name {@link Attribute} to use in the derivation.
		 * @returns {DerivationBuilder}
		 */
		withAttribute(attribute) {
			const a = getAttribute(attribute, this._parent);

			let attributes;
			let generator;

			if (this._derivation) {
				attributes = this._derivation.attributes.concat([ a ]);
				generator = this._derivation.generator;
			} else {
				attributes = [ a ];
				generator = null;
			}

			this._derivation = new Derivation(attributes, generator);

			return this;
		}

		/**
		 * Adds an attribute whose value can be used to derive the attribute's value.
		 *
		 * @public
		 * @param {Function} generator - The function which will be passed an array of
		 * @returns {DerivationBuilder}
		 */
		withGenerator(generator) {
			let attributes;

			if (this._derivation) {
				attributes = this._derivation.attributes;
			} else {
				attributes = [ ];
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