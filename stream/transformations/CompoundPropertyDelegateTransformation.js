const assert = require('@barchart/common-js/lang/assert'),
	attributes = require('@barchart/common-js/lang/attributes');

const DelegateTransformation = require('./DelegateTransformation'),
	Transformation = require('./Transformation');

module.exports = (() => {
	'use strict';

	/**
	 * A {@link Transformation} that reads multiple values from the source
	 * object, passes them to a delegate, then assigns the result to a single
	 * property on the source object.
	 *
	 * @public
	 * @extends {Transformation}
	 * @param {String} inputPropertyNames - The name of the property to read from.
	 * @param {Function} transformDelegate - Accepts the input property value and returns the transformed value.
	 * @param {String} outputPropertyName - The name of the property to write to.
	 * @param {Boolean=} asynchronous - True, if the delegate might run asynchronously.
	 * @param {Function=} canTransformDelegate - Accepts the input property value and indicates if the transform delegate will succeed, passed the same value.
	 * @param {String=} description - Describes the transformation, intended for logging purposes.
	 */
	class CompoundPropertyDelegateTransformation extends Transformation {
		constructor(inputPropertyNames, transformDelegate, outputPropertyName, canTransformDelegate, asynchronous, description) {
			super(description || `Compound Property Transformation ($(outputPropertyName})`);

			assert.argumentIsArray(inputPropertyNames, 'inputPropertyNames', String);
			assert.argumentIsRequired(outputPropertyName, 'outputPropertyName', String);
			assert.argumentIsOptional(description, 'description', String);

			this._inputPropertyNames = inputPropertyNames;
			this._outputPropertyName = outputPropertyName;

			this._delegateTransformation = new DelegateTransformation(transformDelegate, canTransformDelegate, asynchronous);
		}

		get synchronous() {
			return this._delegateTransformation.synchronous;
		}

		_canTransform(input) {
			return verifyInputValues(this._inputPropertyNames, input) && this._delegateTransformation.canTransform(readInputValues(this._inputPropertyNames, input));
		}

		_transform(input) {
			attributes.write(input, this._outputPropertyName, this._delegateTransformation.transform((readInputValues(this._inputPropertyNames, input))));

			return input;
		}

		toString() {
			return '[CompoundPropertyDelegateTransformation]';
		}
	}

	function verifyInputValues(names, source) {
		return names.every(name => attributes.has(source, name));
	}

	function readInputValues(names, source) {
		return names.map(name => attributes.read(source, name));
	}

	return CompoundPropertyDelegateTransformation;
})();
