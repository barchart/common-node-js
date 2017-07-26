var Stream = require('stream');

var IteratorReadStream = require('./../../../stream/IteratorReadStream');

class SpyWriteStream extends Stream.Writable {
	constructor(spy) {
		super({ objectMode: true  });

		this._spy = spy;
	}

	_write(chunk, encoding, callback) {
		this._spy(chunk);

		callback(null);
	}

	toString() {
		return '[EmptyWriteStream]';
	}
}

describe('When a IteratorReadStream is created', function() {
	'use strict';

	describe('from an array of three items', function() {
		var readable;


		beforeEach(function() {
			readable = IteratorReadStream.fromArray([1, 2, 3]);
		});

		describe('and piped to a writable stream', function() {
			var writable;
			var spy;

			beforeEach(function(done) {
				writable = new SpyWriteStream(spy = jasmine.createSpy('write'));

				readable.pipe(writable);

				writable.on('finish', function() {
					done();
				});
			});

			it('should pass the first value to the writer', function() {
				expect(spy.calls.argsFor(0)).toEqual([ 1 ]);
			});

			it('should pass the first value to the writer', function() {
				expect(spy.calls.argsFor(1)).toEqual([ 2 ]);
			});

			it('should pass the first value to the writer', function() {
				expect(spy.calls.argsFor(2)).toEqual([ 3 ]);
			});
		});
	});
});