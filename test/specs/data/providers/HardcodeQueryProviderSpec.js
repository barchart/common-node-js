var HardcodeQueryProvider = require('./../../../../data/providers/HardcodeQueryProvider');

describe('When configured with an object representing a chess game', function() {
	'use strict';

	var processor;
	var configuration;

	beforeEach(function() {
		processor = new HardcodeQueryProvider(configuration = { results: { game: 'chess', moves: [ 'e4', 'e5' ] } } );
	});

	describe('and executed', function() {
		var results;

		beforeEach(function(done) {
			results = processor.runQuery({ completely: 'ignored' })
				.then((r) => {
					results = r;

					done();
				});
		});

		it('should not be a reference to the configuration object', function() {
			expect(results).not.toBe(configuration.results);
		});

		it('should have a matching "game" property', function() {
			expect(results.game).toEqual(configuration.results.game);
		});

		it('should have a "moves" property of the same length', function() {
			expect(results.moves.length).toEqual(configuration.results.moves.length);
		});

		it('should have a "moves" property with the same first move', function() {
			expect(results.moves[0]).toEqual(configuration.results.moves[0]);
		});

		it('should have a "moves" property with the same second move', function() {
			expect(results.moves[1]).toEqual(configuration.results.moves[1]);
		});
	});
});