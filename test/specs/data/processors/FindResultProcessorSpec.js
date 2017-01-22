var FindResultProcessor = require('./../../../../data/processors/FindResultProcessor');

describe('When a FindResultProcessor is used to process an array of objects', function() {
	'use strict';

	var processor;

	beforeEach(function() {
		processor = new FindResultProcessor({ propertyName: 'a', matchValue: 3 });
	});

	describe('and the second item in the array has a matching value', function() {
		var items;
		var result;

		beforeEach(function(done) {
			processor.process(items = [ { a: 2 }, { a: 3 }, { a: 5 } ])
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the result should be an object', function() {
			expect(typeof result).toEqual('object');
		});

		it('the result should be the second item in the array', function() {
			expect(result).toEqual(items[1]);
		});
	});

	describe('and the first and second item in the array have a matching value', function() {
		var items;
		var result;

		beforeEach(function(done) {
			processor.process(items = [ { a: 3 }, { a: 3 }, { a: 5 } ])
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the result should be an object', function() {
			expect(typeof result).toEqual('object');
		});

		it('the result should be the first item in the array', function() {
			expect(result).toEqual(items[0]);
		});
	});

	describe('and the array does not have a matching value', function() {
		var items;
		var result;

		beforeEach(function(done) {
			processor.process(items = [ { a: 2 }, { a: 4 }, { a: 6 } ])
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the result should be undefined', function() {
			expect(typeof result).toEqual('undefined');
		});
	});
});