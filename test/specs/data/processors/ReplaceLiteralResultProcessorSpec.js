var ReplaceLiteralResultProcessor = require('./../../../../data/processors/ReplaceLiteralResultProcessor');

describe('When a ReplaceLiteralResultProcessor is used with literal select and replace values', function() {
	'use strict';

	var processor;

	beforeEach(function() {
		processor = new ReplaceLiteralResultProcessor({ propertyName: 'test', selectVal: 'abc', replaceVal: 'def'  });
	});

	describe('and an object with target property of "abcdef-ABCDEF-abcdef" is processed', function() {
		var result;
		var original;

		beforeEach(function(done) {
			processor.process(original = { test: 'abcdef-ABCDEF-abcdef' })
				.then(function(r) {
					result = r;
					done();
				});
		});

		it('the original object should be returned', function() {
			expect(result).toBe(original);
		});

		it('the "test" property should be mutated', function() {
			expect(result.test).toEqual('defdef-ABCDEF-abcdef');
		});
	});
});

describe('When a ReplaceLiteralResultProcessor is used with referenced select and replace values', function() {
	'use strict';

	var processor;

	beforeEach(function() {
		processor = new ReplaceLiteralResultProcessor({ propertyName: 'test', selectRef: 'previous', replaceRef: 'desired'  });
	});

	describe('and an object with target property of "abcdef-ABCDEF-abcdef" is processed', function() {
		var result;
		var original;

		beforeEach(function(done) {
			processor.process(original = { test: 'abcdef-ABCDEF-abcdef', previous: 'abc', desired: 'def' })
				.then(function(r) {
					result = r;
					done();
				});
		});

		it('the original object should be returned', function() {
			expect(result).toBe(original);
		});

		it('the "test" property should be mutated', function() {
			expect(result.test).toEqual('defdef-ABCDEF-abcdef');
		});
	});
});