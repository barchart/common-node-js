var JsonStringifyResultProcessor = require('./../../../../data/processors/JsonStringifyResultProcessor');

describe('When a simple object is serialized', function() {
	'use strict';

	var resultPromise;

	beforeEach(function() {
		var processor = new JsonStringifyResultProcessor();

		resultPromise = processor.process({ hi: 'there' });
	});

	it('the promised result should be correct', function(done) {
		resultPromise.then(function(result) {
			expect(result).toEqual('{"hi":"there"}');

			done();
		});
	});
});