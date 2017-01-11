var ReplaceResultProcessor = require('./../../../../data/processors/ReplaceResultProcessor');

describe('When a ReplaceResultProcessor is created to replace "abc" with "def"', function() {
	'use strict';

	var processor;

	beforeEach(function() {
		processor = new ReplaceResultProcessor({ propertyName: 'test', selectExpression: "(abc)", replaceExpression: "def"  });
	});

	describe('and an object with target property of "abcdef-abcdef-abcdef" is processed', function() {
		var result;
		var original;

		beforeEach(function(done) {
			processor.process(original = { test: 'abcdef-abcdef-abcdef' })
				.then(function(r) {
					result = r;
					done();
				});
		});

		it('the original object should be returned', function() {
			expect(result).toBe(original);
		});

		it('the "test" property should be mutated', function() {
			expect(result.test).toEqual('defdef-defdef-defdef');
		});
	});
});

describe('When a ReplaceResultProcessor is created adding a dash to any "a" or "b" character', function() {
	'use strict';

	var processor;

	beforeEach(function() {
		processor = new ReplaceResultProcessor({ propertyName: 'test', selectExpression: "([ab])", replaceExpression: "$1-"  });
	});

	describe('and an object with target property of "abcdef-abcdef-abcdef" is processed', function() {
		var result;
		var original;

		beforeEach(function(done) {
			processor.process(original = { test: 'abcdef-abcdef-abcdef' })
				.then(function(r) {
					result = r;
					done();
				});
		});

		it('the original object should be returned', function() {
			expect(result).toBe(original);
		});

		it('the "test" property should be mutated', function() {
			expect(result.test).toEqual('a-b-cdef-a-b-cdef-a-b-cdef');
		});
	});
});