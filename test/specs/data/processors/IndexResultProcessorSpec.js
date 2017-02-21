var IndexResultProcessor = require('./../../../../data/processors/IndexResultProcessor');

describe('When a IndexResultProcessor is used to index an array of word definitions', function() {
	'use strict';

	var processor;

	beforeEach(function() {
		processor = new IndexResultProcessor({ keyPropertyName: 'word' });
	});

	describe('having definitions for coffee, tea, and milk', function() {
		var items;

		var coffee;
		var tea;
		var milk;

		var result;

		beforeEach(function(done) {
			processor.process(items = [ coffee = { word: 'coffee', definition: 'A drink made from beans' }, tea = { word: 'tea', definition: 'A drink made from leaves' }, milk = { word: 'milk', definition: 'A drink made from cows' } ])
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the result should be an object', function() {
			expect(typeof result).toEqual('object');
		});

		it("the result's milk property should be the milk object", function() {
			expect(result.coffee).toBe(coffee);
		});

		it("the result's milk property should be the milk object", function() {
			expect(result.tea).toBe(tea);
		});

		it("the result's milk property should be the milk object", function() {
			expect(result.milk).toBe(milk);
		});
	});
});
