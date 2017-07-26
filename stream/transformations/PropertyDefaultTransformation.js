const assert = require('common/lang/assert'),
	attributes = require('common/lang/attributes'),
	is = require('common/lang/is');

const PropertyTransformation = require('./PropertyTransformation');

module.exports = (() => {
	'use strict';

	class PropertyDefaultTransformation extends PropertyTransformation {
		constructor(propertyName, defaultValue, description) {
			super(propertyName, propertyName, (description || 'Property Default Transformation'));

			this._defaultValue = defaultValue;
		}

		_canTransform(input) {
			return true;
		}

		_transformValue(value) {
			if (is.undefined(value)) {
				return this._defaultValue;
			} else {
				return value;
			}
		}

		toString() {
			return '[PropertyDefaultTransformation]';
		}
	}

	return PropertyDefaultTransformation;
})();
