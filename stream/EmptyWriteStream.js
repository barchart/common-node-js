const object = require('common/lang/object');

const Stream = require('stream');

module.exports = (() => {
	'use strict';

	class EmptyWriteStream extends Stream.Writable {
		constructor(options) {
			super(object.merge({ objectMode: true  }, (options || { })));
		}

		_write(chunk, encoding, callback) {
			callback(null);
		}

		toString() {
			return '[EmptyWriteStream]';
		}
	}

	return EmptyWriteStream;
})();