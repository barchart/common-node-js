var PropertyMapTransformation = require('./../../../../stream/transformations/PropertyMapTransformation');

describe('When a PropertyMapTransformation is created', function() {
	'use strict';

	describe('targeting the "letter" property (without renaming)', function () {
		describe('with a map of characters to ascii values (a, b, and c)', function () {
			var map;
			var transformation;

			beforeEach(function () {
				map = new Map();

				map.set('a', 97);
				map.set('b', 98);
				map.set('c', 99);

				transformation = new PropertyMapTransformation('letter', map);
			});

			it('the transformation checked on an empty object should fail', function () {
				expect(transformation.canTransform({})).toEqual(false);
			});

			it('the transformation invocation on an empty object should throw', function () {
				expect(function () { transformation.transform({}); }).toThrow();
			});

			it('the transformation checked on { "letter": "c" } should succeed', function () {
				expect(transformation.canTransform({letter: 'c'})).toEqual(true);
			});

			it('the transformation invocation on { "letter": "c" } should change the "letter" value to 99', function () {
				expect(transformation.transform({letter: 'c'}).letter).toEqual(99);
			});

			it('the transformation checked on { "letter": "d" } should fail', function () {
				expect(transformation.canTransform({letter: 'd'})).toEqual(false);
			});

			it('the transformation invocation on { "letter": "c" } should throw', function () {
				expect(function() { transformation.transform({letter: 'd'}); }).toThrow();
			});
		});
	});

	describe('targeting the "letter" property (with renaming to "letterCode")', function () {
		describe('with a map of characters to ascii values (a, b, and c)', function () {
			var map;
			var transformation;

			beforeEach(function () {
				map = new Map();

				map.set('a', 97);
				map.set('b', 98);
				map.set('c', 99);

				transformation = new PropertyMapTransformation('letter', map, 'letterCode');
			});

			describe('and the transformation is invoked on { "letter": "c" }', function() {
				var target;
				var result;

				beforeEach(function() {
					result = transformation.transform(target = {letter: 'c'});
				});

				it('the results should be the same object', function () {
					expect(result).toBe(target);
				});

				it('the "letter" property should remain unchanged', function () {
					expect(result.letter).toEqual('c');
				});

				it('the "letterCode" property should remain unchanged', function () {
					expect(result.letterCode).toEqual(99);
				});
			});
		});
	});
});