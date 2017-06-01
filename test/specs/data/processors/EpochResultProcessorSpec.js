var EpochResultProcessor = require('./../../../../data/processors/EpochResultProcessor');

describe('When converting a date milliseconds using the EpochResultProcessor', function() {
	'use strict';

	var processor;

	beforeEach(function() {
		processor = new EpochResultProcessor({ });
	});

	describe('and a date is passed', function() {
		var result;
		var now;

		beforeEach(function(done) {
			processor.process(now = new Date()).then((r) => {
				result = r;

				done();
			});
		});

		it('should return a number', function() {
			expect(typeof result).toEqual('number');
		});

		it('the number should have the correct value', function() {
			expect(result).toEqual(now.getTime());
		});
	});
});