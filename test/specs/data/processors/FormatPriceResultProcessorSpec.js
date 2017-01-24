var FormatPriceResultProcessor = require('./../../../../data/processors/FormatPriceResultProcessor');

describe('When a FormatPriceResultProcessor using property references', function() {
	'use strict';

	var processor;

	beforeEach(function() {
		processor = new FormatPriceResultProcessor({ propertyName: 'price', baseCodePropertyName: 'baseCode', fractionSeparatorPropertyName: 'fractionSeparator'  });
	});

	describe('and an object with a price of 1234.5, unit code of -1, and a dash fraction separator', function() {
		var result;
		var original;

		beforeEach(function(done) {
			processor.process(original = { price: 1234.5, baseCode: -1, fractionSeparator: '-' })
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the original object should be returned', function() {
			expect(result).toBe(original);
		});

		it('the price property should now be a string', function() {
			expect(typeof result.price).toEqual('string');
		});

		it('the price property should be formatted as "1234-4"', function() {
			expect(result.price).toEqual('1234-4');
		});
	});

	describe('and an object with a price of -1234.5, unit code of -1, and a dash fraction separator', function() {
		var result;
		var original;

		beforeEach(function(done) {
			processor.process(original = { price: 1234.5, baseCode: -1, fractionSeparator: '-' })
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the original object should be returned', function() {
			expect(result).toBe(original);
		});

		it('the price property should now be a string', function() {
			expect(typeof result.price).toEqual('string');
		});

		it('the price property should be formatted as "1234-4"', function() {
			expect(result.price).toEqual('1234-4');
		});
	});
});

describe('When a FormatPriceResultProcessor using property references and parenthetical negatives', function() {
	'use strict';

	var processor;

	beforeEach(function() {
		processor = new FormatPriceResultProcessor({ propertyName: 'price', baseCodePropertyName: 'baseCode', fractionSeparatorPropertyName: 'fractionSeparator', useParenthesis: true });
	});

	describe('and an object with a price of 1234.5, unit code of -1, and a dash fraction separator', function() {
		var result;
		var original;

		beforeEach(function(done) {
			processor.process(original = { price: 1234.5, baseCode: -1, fractionSeparator: '-' })
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the original object should be returned', function() {
			expect(result).toBe(original);
		});

		it('the price property should now be a string', function() {
			expect(typeof result.price).toEqual('string');
		});

		it('the price property should be formatted as "1234-4"', function() {
			expect(result.price).toEqual('1234-4');
		});
	});

	describe('and an object with a price of -1234.5, unit code of -1, and a dash fraction separator', function() {
		var result;
		var original;

		beforeEach(function(done) {
			processor.process(original = { price: -1234.5, baseCode: -1, fractionSeparator: '-' })
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the original object should be returned', function() {
			expect(result).toBe(original);
		});

		it('the price property should now be a string', function() {
			expect(typeof result.price).toEqual('string');
		});

		it('the price property should be formatted as "(1234-4)"', function() {
			expect(result.price).toEqual('(1234-4)');
		});
	});
});