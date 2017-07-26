const assert = require('common/lang/assert'),
	attributes = require('common/lang/attributes');

const PropertyTransformation = require('./PropertyTransformation'),
	DelegateTransformation = require('./DelegateTransformation');

module.exports = (() => {
	'use strict';

	class PropertyDelegateTransformation extends PropertyTransformation {
		constructor(property, transformDelegate, asynchronous, canTransformDelegate, description) {
			super(property, (description || 'Delegated Property Transformation'));

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
