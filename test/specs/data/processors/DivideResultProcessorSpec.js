var DivideResultProcessor = require('./../../../../data/processors/DivideResultProcessor');

describe('When a DivideResultProcessor is created, using a denominator reference', function() {
	'use strict';

	var processor;

	beforeEach(function() {
		processor = new DivideResultProcessor({ propertyName: 'milesPerHour', numerator: 120, denominatorRef: 'hours' });
	});

	describe('and an object with a non-zero denominator property is passed', function() {
		var result;
		var original;

		beforeEach(function(done) {
			processor.process(original = { hours: 2 })
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the original object should be returned', function() {
			expect(result).toBe(original);
		});

		it('the original object should now have a "milesPerHour" property', function() {
			expect(result.hasOwnProperty('milesPerHour')).toEqual(true);
		});

		it('the "milesPerHour" property should be 60', function() {
			expect(result.milesPerHour).toEqual(60);
		});
	});

	describe('and an object with a zero denominator property is passed', function() {
		var result;
		var original;

		beforeEach(function(done) {
			processor.process(original = { hours: 0 })
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the original object should be returned', function() {
			expect(result).toBe(original);
		});

		it('the original object should not have a "milesPerHour" property', function() {
			expect(result.hasOwnProperty('milesPerHour')).toEqual(false);
		});
	});

	describe('and an object without the denominator property is passed', function() {
		var result;
		var original;

		beforeEach(function(done) {
			processor.process(original = { })
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the original object should be returned', function() {
			expect(result).toBe(original);
		});

		it('the original object should not have a "milesPerHour" property', function() {
			expect(result.hasOwnProperty('milesPerHour')).toEqual(false);
		});
	});
});

describe('When a DivideResultProcessor is created, using a numerator reference', function() {
	'use strict';

	var processor;

	beforeEach(function() {
		processor = new DivideResultProcessor({ propertyName: 'milesPerHour', numeratorRef: 'miles', denominator: 2 });
	});

	describe('and an object with a non-zero numerator property is passed', function() {
		var result;
		var original;

		beforeEach(function(done) {
			processor.process(original = { miles: 120 })
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the original object should be returned', function() {
			expect(result).toBe(original);
		});

		it('the original object should now have a "milesPerHour" property', function() {
			expect(result.hasOwnProperty('milesPerHour')).toEqual(true);
		});

		it('the "milesPerHour" property should be 60', function() {
			expect(result.milesPerHour).toEqual(60);
		});
	});

	describe('and an object with a zero numerator property is passed', function() {
		var result;
		var original;

		beforeEach(function(done) {
			processor.process(original = { miles: 0 })
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the original object should be returned', function() {
			expect(result).toBe(original);
		});

		it('the original object should now have a "milesPerHour" property', function() {
			expect(result.hasOwnProperty('milesPerHour')).toEqual(true);
		});

		it('the "milesPerHour" property should be 0', function() {
			expect(result.milesPerHour).toEqual(0);
		});
	});

	describe('and an object without the numerator property is passed', function() {
		var result;
		var original;

		beforeEach(function(done) {
			processor.process(original = { })
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the original object should be returned', function() {
			expect(result).toBe(original);
		});

		it('the original object should not have a "milesPerHour" property', function() {
			expect(result.hasOwnProperty('milesPerHour')).toEqual(false);
		});
	});
});