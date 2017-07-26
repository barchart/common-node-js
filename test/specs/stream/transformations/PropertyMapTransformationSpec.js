var PropertyMapTransformation = require('./../../../../stream/transformations/PropertyMapTransformation');

describe('When a PropertyMapTransformation is created', function() {
	'use strict';

	describe('targeting the "letter" property', function () {
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

			it('the transformation checked on { "letter": "c" } should change the letter value to 99', function () {
				expect(transformation.transform({letter: 'c'}).letter).toEqual(99);
			});

			it('the transformation checked on { "letter": "d" } should fail', function () {
				expect(transformation.canTransform({letter: 'd'})).toEqual(false);
			});

			it('the transformation checked on { "letter": "c" } should change the letter value to 99', function () {
				expect(function() { transformation.transform({letter: 'd'}); }).toThrow();
			});
		});
	});
});