module.exports = (() => {
	'use strict';

	/**
	 * Base class for transforming data.
	 *
	 * @interface
	 */
	class Writer {
		constructor() {

		}

		/**
		 * Reads a source object and transcribes it to the target object.
		 *
		 * @param {Object} source
		 * @param {Object} target
		 * @returns {Object}
		 */
		write(source, target) {
			if (this.canWrite(source, target)) {
				this._write(source, target);
			}

			return target;
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

		static get SEPARATOR() {
			return '.';
		}

		toString() {
			return '[Writer]';
		}
	}

	return Writer;
})();