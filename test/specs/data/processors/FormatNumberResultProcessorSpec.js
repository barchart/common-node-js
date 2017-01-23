var FormatNumberResultProcessor = require('./../../../../data/processors/FormatNumberResultProcessor');

describe('When a FormatNumberResultProcessor is created for formatting a "price" property', function() {
	'use strict';

	var processor;

	beforeEach(function() {
		processor = new FormatNumberResultProcessor({ propertyName: 'price', format: '0,0.00' });
	});

	describe('and an object with a price value of 1234.567 is passed', function() {
		var result;
		var original;

		beforeEach(function(done) {
			processor.process(original = { price: 1234.567 })
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

		it('the price property should be formatted as "1,234.57"', function() {
			expect(result.price).toEqual('1,234.57');
		});
	});
});

describe('When a FormatNumberResultProcessor is created for formatting a "change" property', function() {
	'use strict';

	var processor;

	beforeEach(function() {
		processor = new FormatNumberResultProcessor({ propertyName: 'change', format: '0.00%' });
	});

	describe('and an object with a change value of 0.567 is passed', function() {
		var result;
		var original;

		beforeEach(function(done) {
			processor.process(original = { change: 0.56789 })
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the original object should be returned', function() {
			expect(result).toBe(original);
		});

		it('the price property should now be a string', function() {
			expect(typeof result.change).toEqual('string');
		});

		it('the price property should be formatted as "56.79%"', function() {
			expect(result.change).toEqual('56.79%');
		});
	});
});