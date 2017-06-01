var DateParseResultProcessor = require('./../../../../data/processors/DateParseResultProcessor');

describe('When parsing a date using the DateResultParser', function() {
	'use strict';

	var processor;

	beforeEach(function() {
		processor = new DateParseResultProcessor({ dateRef: 'd' });
	});

	describe('a date string formatted as yyyy-MM-dd hh:mm:ss is processed', function() {
		var result;

		beforeEach(function(done) {
			processor.process({
				d: '2017-10-31 23:59:59'
			}).then((r) => {
				result = r;

				done();
			});
		});

		it('should return the a date instance', function() {
			expect(result instanceof Date).toEqual(true);
		});

		it('the date should have the correct value', function() {
			expect(result.getTime()).toEqual((new Date(2017, 9, 31, 23, 59, 59)).getTime());
		});
	});
});