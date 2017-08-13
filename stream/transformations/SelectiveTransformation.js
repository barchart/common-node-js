const assert = require('common/lang/assert'),
	attributes = require('common/lang/attributes');

const Transformation = require('./Transformation');

module.exports = (() => {
	'use strict';

	/**
	 * A transformation that maintains an ordered list of {@link Transformations} and can
	 * either execute all transformations that pass the {@link Transformations#canTransform}
	 * test, or executes the first transformations that pass the {@link Transformations#canTransform}
	 * test
	 *
	 * @public
	 * @param {String} inputPropertyName - The name of the property to read from.
	 * @param {Map} map - The map of translations.
	 * @param {String=} outputPropertyName - The name of the property to write to.
	 * @param {String=} description - Describes the transformation, intended for logging purposes.
	 */
	class SelectiveTransformation extends Transformation {
		constructor(transformations, first, description) {
			super((description || 'Selector Transformation'));

			assert.argumentIsArray(transformations, 'transformations', Transformation, 'Transformation');
			assert.argumentIsOptional(first, 'first', Boolean);

			this._transformations = transformations;

			this._first = first;
			this._synchronous = this._transformations.every(t => t.synchronous);
		}

		get synchronous() {
			return this._synchronous;
		}

		_canTransform(input) {
			return this._transformations.some(t => t.canTransform(input));
		}

		_transform(input) {
			if (this._first) {
				this._transformations.find(t => t.canTransform(input)).transform(input);
			} else {
				this._transformations.filter(t => t.canTransform(input)).transform(input);
			}
		}

		toString() {
			return '[SelectiveTransformation]';
		}
	}


	return SelectiveTransformation;
})();
