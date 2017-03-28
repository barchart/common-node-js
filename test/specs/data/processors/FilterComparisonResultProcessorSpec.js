var FilterComparisonResultProcessor = require('./../../../../data/processors/FilterComparisonResultProcessor');

describe('When a FilterComparisonResultProcessor is created', function () {
	'use strict';

	var trees;

	var seed;
	var sapling;
	var sequoia;

	beforeEach(function() {
		trees = [
			seed = { age: 0, width: 0.01 },
			sapling = { age: 1, width: 0.1 },
			sequoia = { age: 3000, width: 10 }
		];
	});

	describe('and using a "greater than" filter with a hardcoded value', function() {
		var processor;
		var result;

		beforeEach(function(done) {
			processor = new FilterComparisonResultProcessor({ conditions: [ { propertyName: 'age', value: 100, greater: true } ] });

			processor.process(trees).then(function(r) {
				result = r;

				done();
			});
		});

		it('a new array should be returned', function() {
			expect(result).not.toBe(trees);
		});

		it('the new array should have one items', function() {
			expect(result.length).toEqual(1);
		});

		it('the first item should be the sequoia', function() {
			expect(result[0]).toBe(sequoia);
		});
	});

	describe('and using an inverse "greater than" filter with a hardcoded value', function() {
		var processor;
		var result;

		beforeEach(function(done) {
			processor = new FilterComparisonResultProcessor({ conditions: [ { propertyName: 'age', value: 1, greater: true, inverse: true } ] });

			processor.process(trees).then(function(r) {
				result = r;

				done();
			});
		});

		it('a new array should be returned', function() {
			expect(result).not.toBe(trees);
		});

		it('the new array should have one items', function() {
			expect(result.length).toEqual(2);
		});

		it('the first item should be the seed', function() {
			expect(result[0]).toBe(seed);
		});

		it('the first item should be the sapling', function() {
			expect(result[1]).toBe(sapling);
		});
	});
});