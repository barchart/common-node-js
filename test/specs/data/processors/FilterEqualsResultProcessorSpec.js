var FilterEqualsResultProcessor = require('./../../../../data/processors/FilterEqualsResultProcessor');

describe('When a FilterEqualsResultProcessor is created', function () {
	'use strict';

	var original;

	var webstorm;
	var intellij;
	var eclipse;
	var vs;

	beforeEach(function() {
		original = [
			webstorm = { product: 'WebStorm', vendor: 'JetBrains', language: 'JavaScript' },
			intellij = { product: 'IntelliJ', vendor: 'JetBrains', language: 'Java' },
			eclipse = { product: 'Eclipse', vendor: 'Eclipse Foundation', language: 'Java' },
			vs = { product: 'Visual Studio', vendor: 'Microsoft', language: 'C#' },
		];
	});

	describe('and used on used to filter items based on one property', function () {
		var processor;
		var result;

		beforeEach(function(done) {
			processor = new FilterEqualsResultProcessor({ conditions: { vendor: 'JetBrains' }});

			processor.process(original).then(function(r) {
				result = r;

				done();
			});
		});

		it('a new array should be returned', function() {
			expect(result).not.toBe(original);
		});

		it('the new array should have two items', function() {
			expect(result.length).toEqual(2);
		});

		it('the first item should be WebStorm', function() {
			expect(result[0]).toBe(webstorm);
		});

		it('the second item should be IntelliJ', function() {
			expect(result[1]).toBe(intellij);
		});
	});

	describe('and used on used to filter items based on multiple properties', function () {
		var processor;
		var result;

		beforeEach(function (done) {
			processor = new FilterEqualsResultProcessor({ conditions: { vendor: 'JetBrains', language: 'JavaScript' }});

			processor.process(original).then(function (r) {
				result = r;

				done();
			});
		});

		it('a new array should be returned', function () {
			expect(result).not.toBe(original);
		});

		it('the new array should have one item', function() {
			expect(result.length).toEqual(1);
		});

		it('the first item should be WebStorm', function() {
			expect(result[0]).toBe(webstorm);
		});
	});
});