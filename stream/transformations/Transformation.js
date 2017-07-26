const Disposable = require('common/lang/Disposable');

module.exports = (() => {
	'use strict';

	class Transformation extends Disposable {
		constructor() {
			super();
		}

		get synchronous() {
			return true;
		}

		canTransform(input) {
			return true;
		}

		transform(input) {
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
