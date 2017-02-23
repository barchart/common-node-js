var FilterEqualsResultProcessor = require('./../../../../data/processors/FilterEqualsResultProcessor');

describe('When a FilterEqualsResultProcessor is created', function () {
	'use strict';

	var tools;

	var webstorm;
	var intellij;
	var eclipse;
	var vs;

	beforeEach(function() {
		tools = [
			webstorm = { product: 'WebStorm', vendor: 'JetBrains', language: 'JavaScript' },
			intellij = { product: 'IntelliJ', vendor: 'JetBrains', language: 'Java' },
			eclipse = { product: 'Eclipse', vendor: 'Eclipse Foundation', language: 'Java' },
			vs = { product: 'Visual Studio', vendor: 'Microsoft', language: 'C#' }
		];
	});

	describe('and filtering based on hardcoded value(s)', function() {
		describe('for items that are provided by JetBrains', function () {
			var processor;
			var result;

			beforeEach(function(done) {
				processor = new FilterEqualsResultProcessor({ conditions: [ { propertyName: 'vendor', value: 'JetBrains' } ] });

				processor.process(tools).then(function(r) {
					result = r;

					done();
				});
			});

			it('a new array should be returned', function() {
				expect(result).not.toBe(tools);
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

		describe('for items that are not provided by JetBrains', function () {
			var processor;
			var result;

			beforeEach(function(done) {
				processor = new FilterEqualsResultProcessor({ conditions: [ { propertyName: 'vendor', value: 'JetBrains', inverse: true } ] });

				processor.process(tools).then(function(r) {
					result = r;

					done();
				});
			});

			it('a new array should be returned', function() {
				expect(result).not.toBe(tools);
			});

			it('the new array should have two items', function() {
				expect(result.length).toEqual(2);
			});

			it('the first item should be Eclipse', function() {
				expect(result[0]).toBe(eclipse);
			});

			it('the second item should be Visual Studio', function() {
				expect(result[1]).toBe(vs);
			});
		});

		describe('for items that are provided by JetBrains and support JavaScript', function () {
			var processor;
			var result;

			beforeEach(function (done) {
				processor = new FilterEqualsResultProcessor({ conditions:  [ { propertyName: 'vendor', value: 'JetBrains' }, { propertyName: 'language', value: 'JavaScript' } ] });

				processor.process(tools).then(function (r) {
					result = r;

					done();
				});
			});

			it('a new array should be returned', function () {
				expect(result).not.toBe(tools);
			});

			it('the new array should have one item', function() {
				expect(result.length).toEqual(1);
			});

			it('the first item should be WebStorm', function() {
				expect(result[0]).toBe(webstorm);
			});
		});

		describe('for items that are neither JetBrains products or support Java', function () {
			var processor;
			var result;

			beforeEach(function (done) {
				processor = new FilterEqualsResultProcessor({ conditions: [ { propertyName: 'vendor', value: 'JetBrains', inverse: true }, { propertyName: 'language', value: 'Java', inverse: true } ] });

				processor.process(tools).then(function (r) {
					result = r;

					done();
				});
			});

			it('a new array should be returned', function () {
				expect(result).not.toBe(tools);
			});

			it('the new array should have one item', function() {
				expect(result.length).toEqual(1);
			});

			it('the first item should be Visual Studio', function() {
				expect(result[0]).toBe(vs);
			});
		});
	});

	describe('and filtering based on hardcoded value(s)', function() {
		describe('for items that are provided by a dynamic reference', function () {
			var processor;
			var result;

			beforeEach(function(done) {
				processor = new FilterEqualsResultProcessor({ sourceRef: 'ide', conditions: [ { propertyName: 'vendor', valueRef: 'query' } ] });

				processor.process({ ide: tools, query: 'JetBrains' }).then(function(r) {
					result = r;

					done();
				});
			});

			it('a new array should be returned', function() {
				expect(result).not.toBe(tools);
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
	});
});