var GroupingResultProcessor = require('./../../../../data/processors/GroupingResultProcessor');

describe('When a GroupingResultProcessor is created', function () {
	'use strict';

	var processor;

	beforeEach(function () {
		processor = new GroupingResultProcessor({ sourcePropertyName: 'cities', groupPropertyName: 'continent' });
	});

	describe('and an array of cities is grouped by continent', function () {
		var result;

		var original;

		var cities;
		var cairo;
		var rome;
		var lisbon;

		beforeEach(function (done) {
			processor.process(original = {
				cities: cities = [
					cairo = { name: 'Cairo', continent: 'Africa' },
					rome = { name: 'Rome', continent: 'Europe' },
					lisbon = { name: 'Lisbon', continent: 'Europe' }
				]
			}).then(function (r) {
				result = r;

				done();
			});
		});

		it('the original object should be returned', function () {
			expect(result).toBe(original);
		});

		it('the cities property should be the original array', function () {
			expect(result).not.toBe(cities);
		});

		it('the cities property should be an object', function () {
			expect(typeof result.cities).toEqual('object');
		});

		it('the cities property should have an array of European cities', function () {
			expect(Array.isArray(result.cities.Europe)).toEqual(true);
		});

		it('the European continent should have two cities', function () {
			expect(result.cities.Europe.length).toEqual(2);
		});

		it('the first European city should be Rome', function () {
			expect(result.cities.Europe[0]).toBe(rome);
		});

		it('the second European city should be Lisbon', function () {
			expect(result.cities.Europe[1]).toBe(lisbon);
		});

		it('the cities property should have an array of African cities', function () {
			expect(Array.isArray(result.cities.Africa)).toEqual(true);
		});

		it('the African continent should have one city', function () {
			expect(result.cities.Africa.length).toEqual(1);
		});

		it('the first European city should be Rome', function () {
			expect(result.cities.Africa[0]).toBe(cairo);
		});
	});
});