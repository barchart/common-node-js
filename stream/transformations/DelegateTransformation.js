const assert = require('common/lang/assert'),
	is = require('common/lang/is');

const Transformation = require('./Transformation');

module.exports = (() => {
	'use strict';

	/**
	 * Defers all transformation work to a delegate.
	 *
	 * @public
	 * @param {Function} transformDelegate - Accepts the input and returns the transformed value.
	 * @param {Boolean=} asynchronous - True, if the delegates may run asynchronously.
	 * @param {Function=} canTransformDelegate - Accepts the input and indicates if the transform delegate will succeed, passed the same input.
	 * @param {String=} description - Describes the transformation, intended for logging purposes.
	 */
	class DelegateTransformation extends Transformation {
		constructor(transformDelegate, asynchronous, canTransformDelegate, description) {
			super((description || 'Delegated Transformation'));

			assert.argumentIsRequired(transformDelegate, 'transformDelegate', Function);
			assert.argumentIsOptional(asynchronous, 'asynchronous', Boolean);
			assert.argumentIsOptional(canTransformDelegate, 'canTransformDelegate', Function);

			this._transformDelegate = transformDelegate;
			this._canTransformDelegate = canTransformDelegate || (input => true);

			this._synchronous = !(is.boolean(asynchronous) && asynchronous);
		}

		get synchronous() {
			return this._synchronous;
		}

		_canTransform(input) {
			return this._canTransformDelegate(input);
		}

		_transform(input) {
			return this._transformDelegate(input);
		}

		toString() {
			return '[DelegateTransformation]';
		}
	}

	return DelegateTransformation;
})();
