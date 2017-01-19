var AverageResultProcessor = require('./../../../../data/processors/AverageResultProcessor');

describe('When a AverageResultProcessor is used to process an array of objects', function() {
	'use strict';

	var processor;

	beforeEach(function() {
		processor = new AverageResultProcessor({ propertyName: 'a' });
	});

	describe('where each item has a numeric property', function() {
		var items;
		var result;

		beforeEach(function(done) {
			processor.process(items = [ { a: 5 }, { a: 15 }, { a: 40 } ])
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the result should be a number', function() {
			expect(typeof result).toEqual('number');
		});

		it('the result should be the correct average', function() {
			expect(result).toEqual(20);
		});
	});

	describe('where an item is missing the numeric property', function() {
		var items;
		var result;

		beforeEach(function(done) {
			processor.process(items = [ { a: 5 }, { a: 15 }, { b: 40 } ])
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the result should be null', function() {
			expect(result).toEqual(null);
		});
	});
});

describe('When a AverageResultProcessor is used to process an array of numbers', function() {
	'use strict';

	var processor;

	beforeEach(function() {
		processor = new AverageResultProcessor({ });
	});

	describe('where each item is numeric', function() {
		var items;
		var result;

		beforeEach(function(done) {
			processor.process(items = [ 5, 15, 40 ])
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the result should be a number', function() {
			expect(typeof result).toEqual('number');
		});

		it('the result should be the correct sum', function() {
			expect(result).toEqual(20);
		});
	});

	describe('where an item is not numeric property', function() {
		var items;
		var result;

		beforeEach(function(done) {
			processor.process(items = [ 5, 15, null ])
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the result should be null', function() {
			expect(result).toEqual(null);
		});
	});
});