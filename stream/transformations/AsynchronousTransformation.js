const Disposable = require('common/lang/Disposable');

module.exports = (() => {
	'use strict';

	class AsynchronousTransformation extends Disposable {
		constructor() {
			super();
		}

		canTransform(input) {
			return true;
		}

		transform(input) {
			return Promise.resolve().then(() => this._transform(input));
		}

		_transform(input) {
			return input;
		}

		_onDispose() {
			return;
		}

		toString() {
			return '[AsynchronousTransformation]';
		}
	}

	return AsynchronousTransformation;
})();
