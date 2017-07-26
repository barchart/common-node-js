const assert = require('common/lang/assert'),
	Disposable = require('common/lang/Disposable');

module.exports = (() => {
	'use strict';

	class Transformation extends Disposable {
		constructor(description) {
			super();

			assert.argumentIsRequired(description, 'description', String);

			this._description = description;
		}

		get synchronous() {
			return true;
		}

		canTransform(input) {
			return this._canTransform(input);
		}

		_canTransform(input) {
			return true;
		}

		transform(input) {
			if (!this._canTransform(input)) {
				throw new Error('Unable to perform transformation')
			}

			return this._transform(input);
		}

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
