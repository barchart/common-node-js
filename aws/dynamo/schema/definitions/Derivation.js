module.exports = (() => {
	'use strict';

	/**
	 * An attribute value can be derived from other attributes. This object
	 * describes the input required and the function needed to derive an
	 * attribute value.
	 *
	 * @public
	 * @param {Array<Attribute>} name - The attributes used by the generator. Each attribute will be read, then passed to the generator as an array.
	 * @param {Function} generator - The function which derives (i.e. generates) the attribute value.
	 */
	class Derivation {
		constructor(attributes, generator) {
			this._attributes = attributes;
			this._generator = generator;
		}

		/**
		 * The attributes used by the {@link Derivation#generator} function.
		 *
		 * @public
		 * @returns {Array<Attributes>}
		 */
		get attributes() {
			return [...this._attributes];
		}

		/**
		 * The function which derives the value.
		 *
		 * @public
		 * @returns {Function}
		 */
		get generator() {
			return this._generator;
		}

		toString() {
			return '[Derivation]';
		}
	}

	return Derivation;
})();