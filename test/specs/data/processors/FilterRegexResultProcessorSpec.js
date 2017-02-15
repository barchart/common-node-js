var FilterRegexResultProcessor = require('./../../../../data/processors/FilterRegexResultProcessor');

describe('When a FilterRegexResultProcessor is created', function () {
	'use strict';

	var pieces;

	var pawn;
	var king;
	var queen;
	var bishop;
	var knight;
	var rook;

	beforeEach(function() {
		pieces = [
			pawn = { name: 'pawn'},
			king = { name: 'king' },
			queen = { name: 'queen' },
			bishop = { name: 'bishop' },
			knight = { name: 'knight' },
			rook = { name: 'rook' }
		];
	});

	describe('and used to filter names of chess pieces that have consecutive vowels', function () {
		var processor;
		var result;

		beforeEach(function(done) {
			processor = new FilterRegexResultProcessor({ conditions: [ { propertyName: 'name', expression:  '[aeiou]{2}' } ] });

			processor.process(pieces).then(function(r) {
				result = r;

				done();
			});
		});

		it('a new array should be returned', function() {
			expect(result).not.toBe(pieces);
		});

		it('the new array should have two items', function() {
			expect(result.length).toEqual(2);
		});

		it('the first item should be the queen', function() {
			expect(result[0]).toBe(queen);
		});

		it('the second item should be the rook', function() {
			expect(result[1]).toBe(rook);
		});
	});

	describe('and used to filter names of chess pieces that have consecutive vowels and start with the letter q', function () {
		var processor;
		var result;

		beforeEach(function(done) {
			processor = new FilterRegexResultProcessor({ conditions: [ { propertyName: 'name', expression:  '[aeiou]{2}' }, { propertyName: 'name', expression:  '^q' } ] });

			processor.process(pieces).then(function(r) {
				result = r;

				done();
			});
		});

		it('a new array should be returned', function() {
			expect(result).not.toBe(pieces);
		});

		it('the new array should have one item', function() {
			expect(result.length).toEqual(1);
		});

		it('the first item should be the queen', function() {
			expect(result[0]).toBe(queen);
		});
	});

	describe('and used to filter names of chess pieces that do not have consecutive vowels', function () {
		var processor;
		var result;

		beforeEach(function(done) {
			processor = new FilterRegexResultProcessor({ conditions: [ { propertyName: 'name', expression:  '[aeiou]{2}', inverse: true } ] });

			processor.process(pieces).then(function(r) {
				result = r;

				done();
			});
		});

		it('a new array should be returned', function() {
			expect(result).not.toBe(pieces);
		});

		it('the new array should have two items', function() {
			expect(result.length).toEqual(4);
		});

		it('the first item should be the pawn', function() {
			expect(result[0]).toBe(pawn);
		});

		it('the second item should be the king', function() {
			expect(result[1]).toBe(king);
		});

		it('the third item should be the bishop', function() {
			expect(result[2]).toBe(bishop);
		});

		it('the fourth item should be the knight', function() {
			expect(result[3]).toBe(knight);
		});
	});
});