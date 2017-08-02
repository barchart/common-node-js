const assert = require('common/lang/assert'),
	Disposable = require('common/lang/Disposable');

module.exports = (() => {
	'use strict';

	/**
	 * The base class for a logic package used by {@link ObjectTransformer}.
	 *
	 * @public
	 * @interface
	 */
	class Transformation extends Disposable {
		/**
		 * @param {String=} description - Describes the transformation, intended for logging purposes.
		 */
		constructor(description) {
			super();

			assert.argumentIsRequired(description, 'description', String);

			this._description = description;
		}

		/**
		 * Indicates if the {@link Transformation#canTransform} and {@link Transformation#transform}
		 * functions will execute synchronously.
		 *
		 * @public
		 * @returns {Boolean}
		 */
		get synchronous() {
			return true;
		}

		/**
		 * Indicates if the proposed input can successfully be processed by the
		 * {@link Transformation#transform} function.
		 *
		 * @param {*} input
		 * @returns {Boolean}
		 */
		canTransform(input) {
			return this._canTransform(input);
		}

		/**
		 * @protected
		 * @ignore
		 * @param {*} input
		 * @returns {Boolean}
		 */
		_canTransform(input) {
			return true;
		}

		/**
		 * Transforms input (could mutate the input or return another object).
		 *
		 * @param {*} input
		 * @returns {*}
		 */
		transform(input) {
			if (!this._canTransform(input)) {
				throw new Error('Unable to perform transformation');
			}

			return this._transform(input);
		}

		/**
		 * @protected
		 * @ignore
		 * @param {*} input
		 * @returns {Boolean}
		 */
		_transform(input) {
			return input;
		}

		_onDispose() {
			return;
		}

		toString() {
			return '[Transformation]';
		}
	}

	return Transformation;
})();
