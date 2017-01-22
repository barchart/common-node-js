var TreeResultProcessor = require('./../../../../data/processors/TreeResultProcessor');

describe('When a TreeResultProcessor is used to process an array of objects', function() {
	'use strict';

	var processor;

	beforeEach(function() {
		processor = new TreeResultProcessor({ groupBy: 'taxonomy' });
	});

	describe('with types of dogs', function() {
		var arcticFox;
		var redFox;
		var coyote;

		var items;
		var result;

		beforeEach(function(done) {
			processor.process(items = [
				arcticFox = {
					taxonomy: [
						'Canidae',
						'Vulpes'
					],
					species: 'V. lagopus',
					commonName: 'Arctic Fox'
				},
				redFox = {
					taxonomy: [
						'Canidae',
						'Vulpes'
					],
					species: 'V. vulpes',
					commonName: 'Red Fox'
				},
				coyote = {
					taxonomy: [
						'Canidae',
						'Canis'
					],
					species: 'C. latrans',
					commonName: 'Coyote'
				}
			]).then(function(r) {
				result = r;

				done();
			});
		});

		it('the result should be an object', function() {
			expect(typeof result).toEqual('object');
		});

		it('the first family should have one item', function() {
			expect(result.groups.length).toEqual(1);
		});

		it('the first family should be Canidae', function() {
			var canidae = result.groups[0];

			expect(canidae.name).toEqual('Canidae');
		});

		it('the first family should have not have any items', function() {
			var canidae = result.groups[0];

			expect(canidae.hasOwnProperty('items')).toEqual(false);
		});

		it('the Candidae fmaily should be have two genus groups', function() {
			var canidae = result.groups[0];

			expect(canidae.groups.length).toEqual(2);
		});

		it('the Canidae family should contain the Vulpes genus', function() {
			var canidae = result.groups[0];

			expect(canidae.groups.some(s => s.name === 'Vulpes')).toEqual(true);;
		});

		it('the Vulpes genus should have two items', function() {
			var canidae = result.groups[0];
			var vulpes = canidae.groups.find(s => s.name === 'Vulpes');

			expect(vulpes.items.length).toEqual(2);
		});

		it('the Vulpes genus should have an item for the Arctic Fox', function() {
			var canidae = result.groups[0];
			var vulpes = canidae.groups.find(s => s.name === 'Vulpes');

			expect(vulpes.items.find(x => x.species === 'V. lagopus')).toBe(arcticFox);
		});

		it('the Vulpes genus should have an item for the Red Fox', function() {
			var canidae = result.groups[0];
			var vulpes = canidae.groups.find(s => s.name === 'Vulpes');

			expect(vulpes.items.find(x => x.species === 'V. vulpes')).toBe(redFox);
		});

		it('the Canidae family should contain the Canis genus', function() {
			var canidae = result.groups[0];

			expect(canidae.groups.some(s => s.name === 'Canis')).toEqual(true);;
		});

		it('the Canis genus should have one item', function() {
			var canidae = result.groups[0];
			var canis = canidae.groups.find(s => s.name === 'Canis');

			expect(canis.items.length).toEqual(1);
		});

		it('the Canis genus should have an item for the Coyote', function() {
			var canidae = result.groups[0];
			var canis = canidae.groups.find(s => s.name === 'Canis');

			expect(canis.items.find(x => x.species === 'C. latrans')).toBe(coyote);
		});
	});
});
