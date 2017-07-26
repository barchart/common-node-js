const assert = require('common/lang/assert'),
	attributes = require('common/lang/attributes');

const Transformation = require('./Transformation');

module.exports = (() => {
	'use strict';

	class PropertyTransformation extends Transformation {
		constructor(property, descripription) {
			super(descripription);

			assert.argumentIsRequired(property, 'property', String);

			this._propertyName = property;
		}

		_canTransform(input) {
			return attributes.has(input, this._propertyName) && this._canTransformValue(attributes.read(input, this._propertyName));
		}

		_canTransformValue(value) {
			return true;
		}

		_transform(input) {
			attributes.write(input, this._propertyName, this._transformValue(attributes.read(input, this._propertyName)));

			return input;
		}

		_transformValue(value) {
			return value;
		}

		toString() {
			return '[PropertyTransformation]';
		}
	}

	return PropertyTransformation;
})();
