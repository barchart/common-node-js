var PartitionResultProcessor = require('./../../../../data/processors/PartitionResultProcessor');

describe('When a PartitionResultProcessor is created with no configuration', function() {
	'use strict';

	var processor;
	var configuration;

	beforeEach(function() {
		processor = new PartitionResultProcessor(configuration = { });
	});

	describe('and a null value is processed', function() {
		var result;

		beforeEach(function(done) {
			processor.process(null)
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('an array should be returned', function() {
			expect(result instanceof Array).toEqual(true);
		});

		it('the array should have zero items', function() {
			expect(result.length).toEqual(0);
		});
	});

	describe('and an undefined value is processed', function() {
		var result;

		beforeEach(function(done) {
			processor.process(null)
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('an array should be returned', function() {
			expect(result instanceof Array).toEqual(true);
		});

		it('the array should have zero items', function() {
			expect(result.length).toEqual(0);
		});
	});

	describe('and an array with 21 items is passed', function() {
		var input;
		var result;

		beforeEach(function(done) {
			input = [ ];

			for (var i = 0; i < 21; i++) {
				input.push(i);
			}

			result = processor.process(input)
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('an array should be returned', function() {
			expect(result instanceof Array).toEqual(true);
		});

		it('the array should have three items (partitions)', function() {
			expect(result.length).toEqual(3);
		});

		it('the the first partition should have ten items', function() {
			expect(result[0].length).toEqual(10);
		});

		it('the the second partition should have ten items', function() {
			expect(result[1].length).toEqual(10);
		});

		it('the the third partition should have ten items', function() {
			expect(result[2].length).toEqual(1);
		});
	});
});

describe('When a PartitionResultProcessor is created for partitions with 15 items', function() {
	'use strict';

	var processor;
	var configuration;

	beforeEach(function() {
		processor = new PartitionResultProcessor(configuration = { size: 15 });
	});

	describe('and an array with 21 items is passed', function() {
		var input;
		var result;

		beforeEach(function(done) {
			input = [ ];

			for (var i = 0; i < 21; i++) {
				input.push(i);
			}

			result = processor.process(input)
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('an array should be returned', function() {
			expect(result instanceof Array).toEqual(true);
		});

		it('the array should have two items (partitions)', function() {
			expect(result.length).toEqual(2);
		});

		it('the the first partition should have ten items', function() {
			expect(result[0].length).toEqual(15);
		});

		it('the the second partition should have ten items', function() {
			expect(result[1].length).toEqual(6);
		});
	});
});