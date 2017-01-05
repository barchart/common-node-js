var DefaultResultProcessor = require('./../../../../data/processors/DefaultResultProcessor');

describe('When a DefaultResultProcessor is created, specifying a default "name" property', function() {
	'use strict';

	var processor;

	beforeEach(function() {
		processor = new DefaultResultProcessor({ propertyName: 'name', defaultValue: 'Bob' });
	});

	describe('and an object with a "name" property is processed', function() {
		var result;
		var original;

		beforeEach(function(done) {
			processor.process(original = { name: 'Robert' })
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the original object should be returned', function() {
			expect(result).toBe(original);
		});

		it('the name property should be unchanged', function() {
			expect(result.name).toEqual('Robert');
		});
	});

	describe('and an object without a "name" property is processed', function() {
		var result;
		var original;

		beforeEach(function(done) {
			processor.process(original = { })
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the original object should be returned', function() {
			expect(result).toBe(original);
		});

		it('the name property should be set to the default value', function() {
			expect(result.name).toEqual('Bob');
		});
	});
});