const assert = require('common/lang/assert'),
	object = require('common/lang/object');

const Stream = require('stream');

module.exports = (() => {
	'use strict';

	/**
	 * A node.js {@link Stream.Writable} that calls a synchronous delegate
	 * when writing data. By Default, the "objectMode" option is set to true.
	 *
	 * @public
	 * @param {Object=} options
	 */
	class DelegateWriteStream extends Stream.Writable {
		constructor(delegate, options) {
			super(object.merge({ objectMode: true }, (options || { })));

			assert.argumentIsRequired(delegate, 'delegate', Function);

			this._delegate = delegate;
		}

		_write(chunk, encoding, callback) {
			this._delegate(chunk);

			callback(null);
		}

		toString() {
			return '[DelegateWriteStream]';
		}
	}

	return DelegateWriteStream;
})();