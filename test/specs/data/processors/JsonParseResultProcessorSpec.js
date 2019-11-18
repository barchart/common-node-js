const JsonParseResultProcessor = require('./../../../../data/processors/JsonParseResultProcessor');

describe('When a valid JSON string, with a single property, is processed', () => {
	'use strict';

	let resultPromise;

	beforeEach(() => {
		let processor = new JsonParseResultProcessor();

		resultPromise = processor.process('{ "hi": "there" }');
	});

	it('the promised result be an object', function(done) {
		resultPromise.then(function(result) {
			expect(typeof result).toEqual('object');

			done();
		});
	});

	it('the promised result should have the desired property', function(done) {
		resultPromise.then(function(result) {
			expect(result.hasOwnProperty('hi')).toEqual(true);

			done();
		});
	});

	it('the promised result should have the correct property value', function(done) {
		resultPromise.then(function(result) {
			expect(result.hi).toEqual('there');

			done();
		});
	});
});