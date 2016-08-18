var PartionResultProcessor = require('./../../../../data/processors/PartionResultProcessor');

describe('When a PartionResultProcessor is created with no configuration', function() {
	'use strict';

	var processor;
	var configuration;

	beforeEach(function() {
		processor = new PartionResultProcessor(configuration = { });
	});

	it('and a null value is processed', function() {
		var result;

		beforeEach(function() {
			result = processor.process(null);
		});

		it('an array should be returned', function() {
			expect(result instanceof Array).toEqual(true);
		});

		it('the array should have zero items', function() {
			expect(result.length).toEqual(0);
		});
	});

	it('and an undefined value is processed', function() {
		var result;

		beforeEach(function() {
			result = processor.process();
		});

		it('an array should be returned', function() {
			expect(result instanceof Array).toEqual(true);
		});

		it('the array should have zero items', function() {
			expect(result.length).toEqual(0);
		});
	});

	it('and an array with 21 items is passed', function() {
		var input;
		var result;

		beforeEach(function() {
			input = [ ];

			for (var i = 0; i < 21; i++) {
				input.push(i);
			}

			result = processor.process(input);
		});

		it('an array should be returned', function() {
			expect(result instanceof Array).toEqual(true);
		});

		it('the array should have three items (partitions)', function() {
			expect(result.length).toEqual(3);
		});

		it('the the first partition should have ten items', function() {
			expect(result[0].length).toEqual(10);
		});

		it('the the second partition should have ten items', function() {
			expect(result[1].length).toEqual(10);
		});

		it('the the third partition should have ten items', function() {
			expect(result[1].length).toEqual(1);
		});
	});
});