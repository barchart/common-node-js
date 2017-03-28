var CoalesceResultProcessor = require('./../../../../data/processors/CoalesceResultProcessor');

describe('When a CoalesceResultProcessor is used to process an array', function() {
	'use strict';

	var processor;

	beforeEach(function() {
		processor = new CoalesceResultProcessor({ });
	});

	describe('where the first item is null', function() {
		var items;
		var result;

		var one;
		var two;
		var three;

		beforeEach(function(done) {
			processor.process(items = [ one = null, two = 'hello', three = { } ])
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the result should be the second item', function() {
			expect(result).toBe(two);
		});
	});


	describe('where the first item is undefined', function() {
		var items;
		var result;

		var one;
		var two;
		var three;

		beforeEach(function(done) {
			processor.process(items = [ one = undefined, two = [ ], three = 14 ])
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the result should be the second item', function() {
			expect(result).toBe(two);
		});
	});

	describe('where the first item is an object', function() {
		var items;
		var result;

		var one;
		var two;
		var three;

		beforeEach(function(done) {
			processor.process(items = [ one = { }, two = 'test', three = 1234 ])
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the result should be the first item', function() {
			expect(result).toBe(one);
		});
	});
});