var FilterOptionsResultProcessor = require('./../../../../data/processors/FilterOptionsResultProcessor');

describe('When presented with some goods', function() {
	'use strict';

	var context;

	var car;
	var phone;
	var gas;
	var electricity;

	beforeEach(function() {
		context = {
			goods: {
				durable: ['car', 'phone']
			},
			things: [
				car = {
					brand: 'Tesla',
					type: 'car'
				},
				phone = {
					name: 'Apple',
					type: 'phone'
				},
				gas = {
					brand: 'Chevron',
					type: 'gas'
				},
				electricity = {
					brand: 'Consumers',
					type: 'electricity'
				}
			]
		};
	});

	describe('and then filtering for durable goods', function() {
		var processor;
		var result;

		beforeEach(function(done) {
			processor = new FilterOptionsResultProcessor({ sourceRef: 'things', conditions: [ { optionsRef: 'goods.durable', propertyName: 'type' } ] });

			processor.process(context)
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('an array should be returned', function() {
			expect(result instanceof Array).toEqual(true);
		});

		it('the array should have two items', function() {
			expect(result.length).toEqual(2);
		});

		it('the first item should be the car', function() {
			expect(result[0]).toBe(car);
		});

		it('the second item should be the phone', function() {
			expect(result[1]).toBe(phone);
		});
	});

	describe('and then filtering for non-durable goods', function() {
		var processor;
		var result;

		beforeEach(function(done) {
			processor = new FilterOptionsResultProcessor({ sourceRef: 'things', conditions: [ { optionsRef: 'goods.durable', propertyName: 'type', inverse: true } ] });

			processor.process(context)
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('an array should be returned', function() {
			expect(result instanceof Array).toEqual(true);
		});

		it('the array should have two items', function() {
			expect(result.length).toEqual(2);
		});

		it('the first item should be the car', function() {
			expect(result[0]).toBe(gas);
		});

		it('the second item should be the phone', function() {
			expect(result[1]).toBe(electricity);
		});
	});

	describe('and then filtering for Tesla or Chevron products', function() {
		var processor;
		var result;

		beforeEach(function(done) {
			processor = new FilterOptionsResultProcessor({ sourceRef: 'things', conditions: [ { options: [ 'Tesla', 'Chevron' ], propertyName: 'brand'} ] });

			processor.process(context)
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('an array should be returned', function() {
			expect(result instanceof Array).toEqual(true);
		});

		it('the array should have two items', function() {
			expect(result.length).toEqual(2);
		});

		it('the first item should be the car', function() {
			expect(result[0]).toBe(car);
		});

		it('the second item should be the phone', function() {
			expect(result[1]).toBe(gas);
		});
	});
});