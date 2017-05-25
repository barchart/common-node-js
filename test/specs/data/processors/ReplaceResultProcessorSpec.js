var ReplaceResultProcessor = require('./../../../../data/processors/ReplaceResultProcessor');

describe('When a ReplaceResultProcessor is created to replace "abc" with "def"', function() {
	'use strict';

	var processor;

	beforeEach(function() {
		processor = new ReplaceResultProcessor({ propertyName: 'test', selectExpression: "(abc)", replaceExpression: "def"  });
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
			expect(result.test).toEqual('defdef-ABCDEF-defdef');
		});
	});
});

describe('When a ReplaceResultProcessor in case-insensitive mode is created to replace "abc" with "def"', function() {
	'use strict';

	var processor;

	beforeEach(function() {
		processor = new ReplaceResultProcessor({ propertyName: 'test', selectExpression: "(abc)", replaceExpression: "def", insensitive: true  });
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
			expect(result.test).toEqual('defdef-defDEF-defdef');
		});
	});
});

describe('When a ReplaceResultProcessor in non-global mode is created to replace "abc" with "def"', function() {
	'use strict';

	var processor;

	beforeEach(function() {
		processor = new ReplaceResultProcessor({ propertyName: 'test', selectExpression: "(abc)", replaceExpression: "def", global: false  });
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

describe('When a ReplaceResultProcessor is created adding a dash to any "a" or "b" character', function() {
	'use strict';

	var processor;

	beforeEach(function() {
		processor = new ReplaceResultProcessor({ propertyName: 'test', selectExpression: "([ab])", replaceExpression: "$1-"  });
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
			expect(result.test).toEqual('a-b-cdef-ABCDEF-a-b-cdef');
		});
	});
});