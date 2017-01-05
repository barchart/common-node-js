var ExtractResultProcessor = require('./../../../../data/processors/ExtractResultProcessor');

describe('When a ExtractResultProcessor is created', function() {
	'use strict';

	var processor;
	var configuration;

	beforeEach(function() {
		processor = new ExtractResultProcessor(configuration = { propertyName: 'thing' });
	});

	describe('and an array with three items is passed', function() {
		var input;

		var one;
		var two;
		var three;

		var result;

		beforeEach(function(done) {
			input = [
				{ thing: one = '1'},
				{ thing: two = '2'},
				{ thing:  three = '3'}
			];

			processor.process(input)
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('an array should be returned', function() {
			expect(result instanceof Array).toEqual(true);
		});

		it('the array should three items', function() {
			expect(result.length).toEqual(3);
		});

		it('the first item should be one', function() {
			expect(result[0]).toEqual(one);
		});

		it('the second item should be two', function() {
			expect(result[1]).toEqual(two);
		});

		it('the third item should be three', function() {
			expect(result[2]).toEqual(three);
		});
	});
});