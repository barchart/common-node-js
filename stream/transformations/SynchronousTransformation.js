const Disposable = require('common/lang/Disposable');

module.exports = (() => {
	'use strict';

	class SynchronousTransformation extends Disposable {
		constructor() {
			super();
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
			return '[SynchronousTransformation]';
		}
	}

	return SynchronousTransformation;
})();
