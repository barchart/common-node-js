var TranslateResultProcessor = require('./../../../../data/processors/TranslateResultProcessor');

describe('When a TranslateResultProcessor is used on a property with string-based values', function() {
	'use strict';

	var processor;

	beforeEach(function() {
		processor = new TranslateResultProcessor({ propertyName: 'name', 'map': { Eero: 'cool', Bryan: 'super fly' } });
	});

	describe('and the property value matches a value in the map', function() {
		var result;
		var original;

		beforeEach(function(done) {
			processor.process(original = { name: 'Eero' })
				.then(function(r) {
					result = r;
					done();
				});
		});

		it('the original object should be returned', function() {
			expect(result).toBe(original);
		});

		it('the property value should be overwritten with the mapped value', function() {
			expect(result.name).toEqual('cool');
		});
	});

	describe('and the property value does not match value in the map', function() {
		var result;
		var original;

		beforeEach(function(done) {
			processor.process(original = { name: 'Steve' })
				.then(function(r) {
					result = r;
					done();
				});
		});

		it('the original object should be returned', function() {
			expect(result).toBe(original);
		});

		it('the property value should be unchanged', function() {
			expect(result.name).toEqual('Steve');
		});
	});
});


describe('When a TranslateResultProcessor is used on a property with numeric values', function() {
	'use strict';

	var processor;

	beforeEach(function() {
		processor = new TranslateResultProcessor({ propertyName: 'name', 'map': { 1: 'one', 2: 'two' } });
	});

	describe('and the property value matches a value in the map', function() {
		var result;
		var original;

		beforeEach(function(done) {
			processor.process(original = { count: 1 })
				.then(function(r) {
					result = r;
					done();
				});
		});

		it('the original object should be returned', function() {
			expect(result).toBe(original);
		});

		it('the property value should be overwritten with the mapped value', function() {
			expect(result.count).toEqual(1);
		});
	});

	describe('and the property value does not match value in the map', function() {
		var result;
		var original;

		beforeEach(function(done) {
			processor.process(original = { count: 3 })
				.then(function(r) {
					result = r;
					done();
				});
		});

		it('the original object should be returned', function() {
			expect(result).toBe(original);
		});

		it('the property value should be unchanged', function() {
			expect(result.count).toEqual(3);
		});
	});
});