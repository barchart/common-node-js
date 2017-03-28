var FilterExistsResultProcessor = require('./../../../../data/processors/FilterExistsResultProcessor');

describe('When a FilterExistsResultProcessor is created', function () {
	'use strict';

	var things;

	var cat;
	var fish;
	var human;

	beforeEach(function() {
		things = [
			cat = { animal: 'Cat', tail: 'Fluffy', paws: 'Scratchy' },
			fish = { animal: 'Fish', tail: 'Slimy' },
			human = { animal: 'Human', skin: 'Soft' }
		];
	});

	describe('and filtering for property existence', function() {
		describe('for things that have tails', function () {
			var processor;
			var result;

			beforeEach(function(done) {
				processor = new FilterExistsResultProcessor({ conditions: [ { propertyName: 'tail' } ] });

				processor.process(things).then(function(r) {
					result = r;

					done();
				});
			});

			it('a new array should be returned', function() {
				expect(result).not.toBe(things);
			});

			it('the new array should have two items', function() {
				expect(result.length).toEqual(2);
			});

			it('the first item should be the cat', function() {
				expect(result[0]).toBe(cat);
			});

			it('the second item should be the fish', function() {
				expect(result[1]).toBe(fish);
			});
		});
	});

	describe('and filtering for property absence', function() {
		describe('for things that have do not have tails', function () {
			var processor;
			var result;

			beforeEach(function(done) {
				processor = new FilterExistsResultProcessor({ conditions: [ { propertyName: 'tail', inverse: true } ] });

				processor.process(things).then(function(r) {
					result = r;

					done();
				});
			});

			it('a new array should be returned', function() {
				expect(result).not.toBe(things);
			});

			it('the new array should have one item', function() {
				expect(result.length).toEqual(1);
			});

			it('the first item should be the dinosaur', function() {
				expect(result[0]).toBe(human);
			});
		});
	});

	describe('and filtering for combinations of property property existance and absence', function() {
		describe('for things that have tails and do not have paws', function () {
			var processor;
			var result;

			beforeEach(function(done) {
				processor = new FilterExistsResultProcessor({ conditions: [ { propertyName: 'tail'}, { propertyName: 'paws', inverse: true }  ] });

				processor.process(things).then(function(r) {
					result = r;

					done();
				});
			});

			it('a new array should be returned', function() {
				expect(result).not.toBe(things);
			});

			it('the new array should have two items', function() {
				expect(result.length).toEqual(1);
			});

			it('the first item should be the fish', function() {
				expect(result[0]).toBe(fish);
			});
		});
	});
});