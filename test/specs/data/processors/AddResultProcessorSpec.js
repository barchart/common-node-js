var AddResultProcessor = require('./../../../../data/processors/AddResultProcessor');

describe('When a AddResultProcessor is created, using a right reference', function() {
	'use strict';

	var processor;

	beforeEach(function() {
		processor = new AddResultProcessor({ propertyName: 'sum', left: 1, rightRef: 'right' });
	});

	describe('and an object with a non-zero right property is passed', function() {
		var result;
		var original;

		beforeEach(function(done) {
			processor.process(original = { right: 2 })
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the original object should be returned', function() {
			expect(result).toBe(original);
		});

		it('the original object should now have a "sum" property', function() {
			expect(result.hasOwnProperty('sum')).toEqual(true);
		});

		it('the "sum" property should be 3', function() {
			expect(result.sum).toEqual(3);
		});
	});

	describe('and an object without the right property is passed', function() {
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

		it('the original object should not have a "sum" property', function() {
			expect(result.hasOwnProperty('sum')).toEqual(false);
		});
	});
});

describe('When a AddResultProcessor is created, using a left reference', function() {
	'use strict';

	var processor;

	beforeEach(function() {
		processor = new AddResultProcessor({ propertyName: 'sum', leftRef: 'left', right: 2 });
	});

	describe('and an object with a non-zero left property is passed', function() {
		var result;
		var original;

		beforeEach(function(done) {
			processor.process(original = { left: 1 })
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the original object should be returned', function() {
			expect(result).toBe(original);
		});

		it('the original object should now have a "sum" property', function() {
			expect(result.hasOwnProperty('sum')).toEqual(true);
		});

		it('the "sum" property should be 3', function() {
			expect(result.sum).toEqual(3);
		});
	});

	describe('and an object without the left property is passed', function() {
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

		it('the original object should not have a "sum" property', function() {
			expect(result.hasOwnProperty('sum')).toEqual(false);
		});
	});
});