var AggregateResultProcessor = require('./../../../../data/processors/AggregateResultProcessor');

describe('When a AggregateResultProcessor is createdn', function() {
	'use strict';

	var processor;

	beforeEach(function() {
		processor = new AggregateResultProcessor();
	});

	describe('and a null value is processed', function() {
		var result;

		beforeEach(function(done) {
			result = processor.process(null)
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('an array should be returned', function() {
			expect(result instanceof Array).toEqual(true);
		});

		it('the array should have zero items', function() {
			expect(result.length).toEqual(0);
		});
	});

	describe('and an undefined value is processed', function() {
		var result;

		beforeEach(function(done) {
			result = processor.process()
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('an array should be returned', function() {
			expect(result instanceof Array).toEqual(true);
		});

		it('the array should have zero items', function() {
			expect(result.length).toEqual(0);
		});
	});

	describe('and an array with three items is passed', function() {
		var input;

		var one;
		var two;
		var three;
		var four;
		var five;

		var result;

		beforeEach(function(done) {
			input = [
				[
					one = 1,
					two = 2
				],
				[
					three = 3,
					four = 4
				],
				[
					five = 5
				]
			];

			result = processor.process(input)
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('an array should be returned', function() {
			expect(result instanceof Array).toEqual(true);
		});

		it('the array should five items', function() {
			expect(result.length).toEqual(5);
		});

		it('the first item should be one', function() {
			expect(result[0]).toEqual(one);
		});

		it('the second item should be one', function() {
			expect(result[1]).toEqual(two);
		});

		it('the third item should be one', function() {
			expect(result[2]).toEqual(three);
		});

		it('the fourth item should be one', function() {
			expect(result[3]).toEqual(four);
		});

		it('the fifth item should be one', function() {
			expect(result[4]).toEqual(five);
		});
	});
});