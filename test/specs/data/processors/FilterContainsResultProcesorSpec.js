var FilterContainsResultProcessor = require('./../../../../data/processors/FilterContainsResultProcessor');

describe('When a filtering an array based on containment of a single value', function() {
	'use strict';

	var processor;

	beforeEach(function() {
		processor = new FilterContainsResultProcessor({ outerArrayPropertyName: 'things', innerArrayPropertyName: 'colors', valuePropertyName: 'desiredColor' });
	});

	describe('and an array with some matching items is passed', function() {
		var result;

		var context;

		var blueTang;
		var clownfish;
		var goldfish;
		var orca;
		var damsel;

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
					damsel = {
						name: 'Three Striped Damsel',
						colors: [ 'black', 'white' ]
					}
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

		it('the array should have three items', function() {
			expect(result.length).toEqual(3);
		});

		it('the first item should be the clownfish', function() {
			expect(result[0]).toBe(clownfish);
		});

		it('the second item should be the orca', function() {
			expect(result[1]).toBe(orca);
		});

		it('the third item should be the damsel', function() {
			expect(result[2]).toBe(damsel);
		});
	});
});

describe('When a filtering an array based on containment of a set of possible values', function() {
	'use strict';

	var processor;

	beforeEach(function() {
		processor = new FilterContainsResultProcessor({ outerArrayPropertyName: 'things', innerArrayPropertyName: 'colors', valuesPropertyName: 'desiredColors' });
	});

	describe('and an array with some matching items is passed', function() {
		var result;

		var context;

		var blueTang;
		var clownfish;
		var goldfish;
		var orca;
		var damsel;

		beforeEach(function(done) {
			context = {
				desiredColors:  [ 'yellow', 'gold' ],
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
					damsel = {
						name: 'Three Striped Damsel',
						colors: [ 'black', 'white' ]
					}
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

		it('the first item should be the blue tang', function() {
			expect(result[0]).toBe(blueTang);
		});

		it('the second item should be the goldfish', function() {
			expect(result[1]).toBe(goldfish);
		});
	});
});

describe('When a filtering an array based on matching exact values', function() {
	'use strict';

	var processor;

	beforeEach(function() {
		processor = new FilterContainsResultProcessor({ outerArrayPropertyName: 'things', innerArrayPropertyName: 'colors', valuesPropertyName: 'desiredColors', exact: true });
	});

	describe('and an array with some matching items is passed', function() {
		var result;

		var context;

		var blueTang;
		var clownfish;
		var goldfish;
		var orca;
		var damsel;

		beforeEach(function(done) {
			context = {
				desiredColors:  [ 'black', 'white' ],
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
					damsel = {
						name: 'Three Striped Damsel',
						colors: [ 'black', 'white' ]
					}
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

		it('the array should have one item', function() {
			expect(result.length).toEqual(1);
		});

		it('the first item should be the damsel', function() {
			expect(result[0]).toBe(damsel);
		});
	});
});