const assert = require('common/lang/assert'),
	is = require('common/lang/is');

const Writer = require('./Writer');

module.exports = (() => {
	'use strict';

	/**
	 * An implementation of {@link Writer} that delegates to an array
	 * of {@link Writer} instances.
	 *
	 * @public
	 */
	class CompositeWriter extends Writer {
		constructor(writers) {
			super();

			assert.argumentIsArray(writers, 'writers', Writer, 'Writer');

			this._writers = writers;
		}

		_write(source, target) {
			return this._writers.reduce((targetToUse, writer) => writer._write(source, targetToUse), target);
		}

		_canTranslate(source, target) {
			return true;
		}

		toString() {
			return '[CompositeWriter]';
		}
	}

	return CompositeWriter;
})();