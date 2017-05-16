var ScalarResultProcessor = require('./../../../../data/processors/ScalarResultProcessor');

describe('When a ScalarResultProcessor is used to process an array', function() {
	'use strict';

	var processor;

	var items;
	var result;

	beforeEach(function() {
		processor = new ScalarResultProcessor({ });
	});

	describe('that is empty', function() {
		var items;
		var result;

		beforeEach(function(done) {
			processor.process(items = [ ])
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the result should be undefined', function() {
			expect(result).toEqual(undefined);
		});
	});

	describe('that has one item', function() {
		var items;
		var item;
		var result;

		beforeEach(function(done) {
			processor.process(items = [ item = { } ])
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the result should be undefined', function() {
			expect(result).toEqual(item);
		});
	});

	describe('that has two items', function() {
		var items;
		var result;

		var threw;

		beforeEach(function(done) {
			processor.process(items = [ { }, { } ])
				.then(function(r) {
					threw = false;

					done();
				}).catch(function() {
					threw = true;

					done();
				});
		});

		it('an error should be thrown', function() {
			expect(threw).toEqual(true);
		});
	});
});