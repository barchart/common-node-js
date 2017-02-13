var MapResultProcessor = require('./../../../../data/processors/MapResultProcessor');

describe('When a MapResultProcessor is created', function () {
	'use strict';

	var processor;

	beforeEach(function () {
		processor = new MapResultProcessor({targetPropertyName: 'letters', mapPropertyName: 'alphabet'});
	});

	describe('and an array of letters is passed', function () {
		var result;

		var original;

		var map;
		var letters;

		beforeEach(function (done) {
			processor.process(original = {
				alphabet: map = {a: 'alpha', b: 'beta', c: 'charlie'},
				letters: letters = ['a', 'c', 'e']
			}).then(function (r) {
				result = r;

				done();
			});
		});

		it('the original object should be returned', function () {
			expect(result).toBe(original);
		});

		it('the letters array should be a new array', function () {
			expect(result.letters).not.toBe(letters);
		});

		it('letters array should be the same size', function () {
			expect(result.letters.size).toEqual(letters.size);
		});

		it('the first letter should be mapped', function () {
			expect(result.letters[0]).toEqual('alpha');
		});

		it('the second letter should be mapped', function () {
			expect(result.letters[1]).toEqual('charlie');
		});

		it('the third letter should not be mapped', function () {
			expect(result.letters[2]).toEqual('e');
		});
	});
});