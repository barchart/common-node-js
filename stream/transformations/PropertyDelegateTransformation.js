const assert = require('common/lang/assert'),
	attributes = require('common/lang/attributes');

const PropertyTransformation = require('./PropertyTransformation'),
	DelegateTransformation = require('./DelegateTransformation');

module.exports = (() => {
	'use strict';

	/**
	 * Reads a property value, passes that value to a delegate, and writes
	 * the output of the delegate to the same (or another) property.
	 *
	 * @public
	 */
	class PropertyDelegateTransformation extends PropertyTransformation {
		/**
		 * @param {String} inputPropertyName - The name of the property to read from.
		 * @param {Function} transformDelegate - Accepts the input property value and returns the transformed value.
		 * @param {String=} outputPropertyName - The name of the property to write to.
		 * @param {Boolean=} asynchronous - True, if the delegates may run asynchronously.
		 * @param {Function=} canTransformDelegate - Accepts the input property value and indicates if the transform delegate will succeed, passed the same value.
		 * @param {String=} description - Describes the transformation, intended for logging purposes.
		 */
		constructor(inputPropertyName, transformDelegate, outputPropertyName, asynchronous, canTransformDelegate, description) {
			super(inputPropertyName, outputPropertyName, (description || 'Delegated Property Transformation'));

			this._delegateTransformation = new DelegateTransformation(transformDelegate, asynchronous, canTransformDelegate);
		}

		_canTransformValue(value) {
			return this._delegateTransformation.canTransform(value);
		}

		_transformValue(value) {
			return this._delegateTransformation.transform(value);
		}

		toString() {
			return '[PropertyDelegateTransformation]';
		}
	}

	return PropertyDelegateTransformation;
})();
