var ConvertResultProcessor = require('./../../../../data/processors/ConvertResultProcessor');

describe('When a ConvertResultProcessor is created to convert "age" property to a string', function() {
	'use strict';

	var processor;

	beforeEach(function() {
		processor = new ConvertResultProcessor({ propertyName: 'age', propertyType: 'string' });
	});

	describe('and an object with a "age" property is processed', function() {
		var result;
		var original;

		beforeEach(function(done) {
			processor.process(original = { age: 42 })
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the original object should be returned', function() {
			expect(result).toBe(original);
		});

		it('the "age" property should be a string', function() {
			expect(typeof result.age).toEqual('string');
		});

		it('the "age" property should be 42', function() {
			expect(result.age).toEqual('42');
		});
	});
});