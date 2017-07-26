const assert = require('common/lang/assert'),
	is = require('common/lang/is');

const Transformation = require('./Transformation');

module.exports = (() => {
	'use strict';

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
