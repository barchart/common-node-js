const assert = require('@barchart/common-js/lang/assert'),
	is = require('@barchart/common-js/lang/is');

module.exports = (() => {
	'use strict';

	/**
	 * An attributes value can be derived from other attributes. This object
	 * describes the input required and the function needed to derive said value.
	 *
	 * @public
	 * @param {String} name
	 * @param {Function} generator
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
		 * The function which derives the vaue.
		 *
		 * @public
		 * @returns {Function}
		 */
		get generator() {
			return this._generator;
		}

		toString() {
			return `[Derivation (name=${this._name})]`;
		}
	}

	return Derivation;
})();