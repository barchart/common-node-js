var SumResultProcessor = require('./../../../../data/processors/SumResultProcessor');

describe('When a SumResultProcessor is used to process an array of objects', function() {
	'use strict';

	var processor;

	beforeEach(function() {
		processor = new SumResultProcessor({ propertyName: 'a' });
	});

	describe('where each item has a numeric property', function() {
		var items;
		var result;

		beforeEach(function(done) {
			processor.process(items = [ { a: 2 }, { a: 3 }, { a: 5 } ])
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the result should be a number', function() {
			expect(typeof result).toEqual('number');
		});

		it('the result should be the correct sum', function() {
			expect(result).toEqual(10);
		});
	});

	describe('where an item is missing the numeric property', function() {
		var items;
		var result;

		beforeEach(function(done) {
			processor.process(items = [ { a: 2 }, { a: 3 }, { b: 5 } ])
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

describe('When a SumResultProcessor is used to process an array of numbers', function() {
	'use strict';

	var processor;

	beforeEach(function() {
		processor = new SumResultProcessor({ });
	});

	describe('where each item is numeric', function() {
		var items;
		var result;

		beforeEach(function(done) {
			processor.process(items = [ 2, 3, 5 ])
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the result should be a number', function() {
			expect(typeof result).toEqual('number');
		});

		it('the result should be the correct sum', function() {
			expect(result).toEqual(10);
		});
	});

	describe('where an item is not numeric property', function() {
		var items;
		var result;

		beforeEach(function(done) {
			processor.process(items = [ 2, null, 5 ])
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

describe('When a SumResultProcessor is used process a zero-length array', function() {
	'use strict';

	var processor;

	beforeEach(function() {
		processor = new SumResultProcessor({ });
	});

	describe('where each item is numeric', function() {
		var items;
		var result;

		beforeEach(function(done) {
			processor.process(items = [ ])
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the result should be a number', function() {
			expect(typeof result).toEqual('number');
		});

		it('the result should be the correct sum', function() {
			expect(result).toEqual(0);
		});
	});
});