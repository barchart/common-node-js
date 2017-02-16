var UnwrapResultProcessor = require('./../../../../data/processors/UnwrapResultProcessor');

describe('When a UnwrapResultProcessor is created', function() {
	'use strict';

	var processor;
	var configuration;

	beforeEach(function() {
		processor = new UnwrapResultProcessor(configuration = { propertyName: 'a.b.c' });
	});

	describe('and an object, having the property name, is unwrapped', function() {
		var context;
		var result;

		beforeEach(function(done) {
			processor.process(context = { a: { b: { c: { } } } })
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the result should be an object', function() {
			expect(result instanceof Object).toEqual(true);
		});

		it('the result should be a reference to the context object', function() {
			expect(result).toBe(context.a.b.c);
		});
	});
});