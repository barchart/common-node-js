module.exports = (() => {
	'use strict';

	class Writer {
		constructor() {

		}

		write(source, target) {
			if (this.canWrite(source, target)) {
				this._write(source, target);
			}
		}

		/**
		 * @protected
		 * @abstract
		 */
		_write(source, target) {
			return;
		}

		canWrite(source, target) {
			return this._canWrite(source, target);
		}

		/**
		 * @protected
		 * @abstract
		 */
		_canWrite(source, target) {
			return true;
		}

		toString() {
			return '[Writer]';
		}
	}

	return Writer;
})();