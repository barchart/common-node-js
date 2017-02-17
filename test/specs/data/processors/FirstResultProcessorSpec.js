var FirstResultProcessor = require('./../../../../data/processors/FirstResultProcessor');

describe('When a FirstResultProcessor is created', function () {
	'use strict';

	var processor;

	beforeEach(function () {
		processor = new FirstResultProcessor();
	});

	describe('and an array with three values is passed', function () {
		var result;

		var original;

		var fa;
		var so;
		var la;

		beforeEach(function (done) {
			processor.process(original = [ fa = {note: 'fa'}, so = {note: 'so'}, la = {note: 'la'}]).then(function (r) {
				result = r;

				done();
			});
		});

		it('the "fa" object should be returned', function () {
			expect(result).toBe(fa);
		});
	});
});