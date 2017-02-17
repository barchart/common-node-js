var DistinctResultProcessor = require('./../../../../data/processors/DistinctResultProcessor');

describe('When a DistinctResultProcessor is created and "wrapping" is desired', function () {
	'use strict';

	var processor;

	beforeEach(function () {
		processor = new DistinctResultProcessor({property: 'firstName', wrap: true});
	});

	describe('and and used to extract unique first names', function () {
		var result;

		var original;

		var map;
		var letters;

		beforeEach(function (done) {
			processor.process(original = [ { firstName: 'Bill', lastName: 'Clinton'}, { firstName: 'Bill', lastName: 'Moyers'}, { firstName: 'Hillary', lastName: 'Clinton'} ]).then(function (r) {
				result = r;

				done();
			});
		});

		it('the original object should not be returned', function () {
			expect(result).not.toBe(original);
		});

		it('the returned object should be an array', function () {
			expect(Array.isArray(result)).toEqual(true);
		});

		it('there should be two distinct first names', function () {
			expect(result.length).toEqual(2);
		});

		it('the first name should be "Bill"', function () {
			expect(result[0].firstName).toEqual('Bill');
		});

		it('the second name should be "Hillary"', function () {
			expect(result[1].firstName).toEqual('Hillary');
		});
	});
});

describe('When a DistinctResultProcessor is created and "wrapping" is not desired', function () {
	'use strict';

	var processor;

	beforeEach(function () {
		processor = new DistinctResultProcessor({property: 'firstName', wrap: false});
	});

	describe('and and used to extract unique first names', function () {
		var result;

		var original;

		var map;
		var letters;

		beforeEach(function (done) {
			processor.process(original = [ { firstName: 'Bill', lastName: 'Clinton'}, { firstName: 'Bill', lastName: 'Moyers'}, { firstName: 'Hillary', lastName: 'Clinton'} ]).then(function (r) {
				result = r;

				done();
			});
		});

		it('the original object should not be returned', function () {
			expect(result).not.toBe(original);
		});

		it('the returned object should be an array', function () {
			expect(Array.isArray(result)).toEqual(true);
		});

		it('there should be two distinct first names', function () {
			expect(result.length).toEqual(2);
		});

		it('the first name should be "Bill"', function () {
			expect(result[0]).toEqual('Bill');
		});

		it('the second name should be "Hillary"', function () {
			expect(result[1]).toEqual('Hillary');
		});
	});
});