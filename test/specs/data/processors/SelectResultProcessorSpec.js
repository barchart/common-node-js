var SelectResultProcessor = require('./../../../../data/processors/SelectResultProcessor');

describe('When a SelectResultProcessor is created, selecting properties "a" as "b" and "c" as "d"', function() {
	'use strict';

	var processor;

	beforeEach(function () {
		processor = new SelectResultProcessor({ properties: { a: 'b', c: 'd' }});
	});

	describe('and an object with properties "a" and "c" is processed', function() {
		var result;
		var input;

		beforeEach(function(done) {
			processor.process(input = { a: { }, c: { }})
				.then((r) => {
					result = r;

					done();
				});
		});

		it('the result should not be the same object', function() {
			expect(result).not.toBe(input);
		});

		it('the result "b" property should be the same as the input "a" property', function() {
			expect(result.b).toBe(input.a);
		});

		it('the result "d" property should be the same as the input "c" property', function() {
			expect(result.d).toBe(input.c);
		});
	});

	describe('and an an array of two items, both with properties "a" and "c" is processed', function() {
		var result;
		var input;

		beforeEach(function(done) {
			processor.process(input = [ { a: { }, c: { } }, { a: { }, c: { } } ])
				.then((r) => {
					result = r;

					done();
				});
		});

		it('the result should not be the same object', function() {
			expect(result).not.toBe(input);
		});

		it('the result should have two items', function() {
			expect(result.length).toEqual(2);
		});


		it('the result should not be the same object', function() {
			expect(result).not.toBe(input);
		});

		it('the first result object should not be the first input object', function() {
			expect(result[0]).not.toBe(input[0]);
		});

		it('the second result object should not be the first second object', function() {
			expect(result[1]).not.toBe(input[1]);
		});

		it('on the first object, the result "b" property should be the same as the input "a" property', function() {
			expect(result[0].b).toBe(input[0].a);
		});

		it('on the first object, the result "d" property should be the same as the input "c" property', function() {
			expect(result[0].d).toBe(input[0].c);
		});

		it('on the second object, the result "b" property should be the same as the input "a" property', function() {
			expect(result[1].b).toBe(input[1].a);
		});

		it('on the second object, the result "d" property should be the same as the input "c" property', function() {
			expect(result[1].d).toBe(input[1].c);
		});
	});
});