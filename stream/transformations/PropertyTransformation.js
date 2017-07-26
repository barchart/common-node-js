const assert = require('common/lang/assert'),
	attributes = require('common/lang/attributes');

const Transformation = require('./Transformation');

module.exports = (() => {
	'use strict';

	class PropertyTransformation extends Transformation {
		constructor(inputPropertyName, outputPropertyName, descripription) {
			super(descripription);

			assert.argumentIsRequired(inputPropertyName, 'inputPropertyName', String);
			assert.argumentIsOptional(outputPropertyName, 'inputPropertyName', String);
			assert.argumentIsOptional(descripription, 'descripription', String);

			this._inputPropertyName = inputPropertyName;
			this._outputPropertyName = outputPropertyName || inputPropertyName;
		}

		_canTransform(input) {
			return attributes.has(input, this._inputPropertyName) && this._canTransformValue(attributes.read(input, this._inputPropertyName));
		}

		_canTransformValue(value) {
			return true;
		}

		_transform(input) {
			attributes.write(input, this._outputPropertyName, this._transformValue(attributes.read(input, this._inputPropertyName)));

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
