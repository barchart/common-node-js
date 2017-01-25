var FilterContainsResultProcessor = require('./../../../../data/processors/FilterContainsResultProcessor');

describe('When a FilterContainsResultProcessor targeting an array of primatives', function() {
	'use strict';

	var processor;

	beforeEach(function() {
		processor = new FilterContainsResultProcessor({ sourcePropertyName: 'things', matchPropertyName: 'desiredColor', matchTargetsPropertyName: 'colors' });
	});

	describe('and an array with some matching items is passed', function() {
		var result;

		var context;

		var blueTang;
		var clownfish;
		var goldfish;
		var orca;

		beforeEach(function(done) {
			context = {
				desiredColor: 'white',
				things: [
					blueTang = {
						name: 'Blue Tang',
						colors: [ 'blue', 'black', 'yellow' ]
					},
					clownfish = {
						name: 'Clownfish',
						colors: [ 'black', 'orange', 'white' ]
					},
					goldfish = {
						name: 'Goldfish',
						colors: [ 'gold' ]
					},
					orca = {
						name: 'Orca',
						colors: [ 'white', 'black' ]
					},
				]
			};

			processor.process(context)
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('an array should be returned', function() {
			expect(result instanceof Array).toEqual(true);
		});

		it('the array should have two items', function() {
			expect(result.length).toEqual(2);
		});

		it('the first item should be the clownfish', function() {
			expect(result[0]).toBe(clownfish);
		});

		it('the first item should be the orca', function() {
			expect(result[1]).toBe(orca);
		});
	});
});