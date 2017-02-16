var WrapResultProcessor = require('./../../../../data/processors/WrapResultProcessor');

describe('When a WrapResultProcessor is created', function() {
	'use strict';

	var processor;
	var configuration;

	beforeEach(function() {
		processor = new WrapResultProcessor(configuration = { propertyName: 'test' });
	});

	describe('and an object is wrapped', function() {
		var input;
		var result;

		beforeEach(function(done) {
			processor.process(input = { wrap: 'me' })
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the result should be an object', function() {
			expect(result instanceof Object).toEqual(true);
		});

		it('the result should not be the input object', function() {
			expect(result).not.toBe(input);
		});

		it('the result should have a property name (as specified in configuration)', function() {
			expect(result.hasOwnProperty(configuration.propertyName)).toBe(true);
		});

		it('the result should wrap the input', function() {
			expect(result[configuration.propertyName]).toBe(input);
		});
	});
});