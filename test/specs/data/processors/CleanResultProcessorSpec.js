var CleanResultProcessor = require('./../../../../data/processors/CleanResultProcessor');

describe('When a CleanResultProcessor is used on an object', function() {
	'use strict';

	var processor;
	var original;

	var e;
	var f;

	beforeEach(function() {
		processor = new CleanResultProcessor({ });

		original = {
			a: null,
			b: undefined,
			c: 3,
			d: 'four',
			e: e = {},
			f: f = []
		};
	});

	describe('properties that are null should be deleted', function() {
		var result;

		beforeEach(function(done) {
			processor.process(original)
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the original object should be returned', function() {
			expect(result).toBe(original);
		});

		it('the original object should not have an "a" property', function() {
			expect(result.hasOwnProperty('a')).toEqual(false);
		});
	});

	describe('properties that are undefined should be deleted', function() {
		var result;

		beforeEach(function(done) {
			processor.process(original)
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the original object should not have an "b" property', function() {
			expect(result.hasOwnProperty('b')).toEqual(false);
		});
	});

	describe('properties that are numbers should not be affected', function() {
		var result;

		beforeEach(function(done) {
			processor.process(original)
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the original object should have an "c" property', function() {
			expect(result.c).toEqual(3);
		});
	});

	describe('properties that are numbers should not be affected', function() {
		var result;

		beforeEach(function(done) {
			processor.process(original)
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the original object should have an "d" property', function() {
			expect(result.d).toEqual('four');
		});
	});

	describe('properties that are objects should not be affected', function() {
		var result;

		beforeEach(function(done) {
			processor.process(original)
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the original object should have an "e" property', function() {
			expect(result.e).toBe(e);
		});
	});

	describe('properties that are arrays should not be affected', function() {
		var result;

		beforeEach(function(done) {
			processor.process(original)
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the original object should have an "f" property', function() {
			expect(result.f).toBe(f);
		});
	});
});

describe('When a CleanResultProcessor is used on a single property (that is an object)', function() {
	'use strict';

	var processor;
	var original;

	var xyz;
	var e;
	var f;

	beforeEach(function() {
		processor = new CleanResultProcessor({ propertyName: 'xyz' });

		original = {
			xyz: xyz = {
				a: null,
				b: undefined,
				c: 3,
				d: 'four',
				e: e = {},
				f: f = []
			}
		};
	});

	describe('the wrapper property should be unaffected', function() {
		var result;

		beforeEach(function(done) {
			processor.process(original)
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the original object should be returned', function() {
			expect(result).toBe(original);
		});

		it('the original object should not have an "xyz" property', function() {
			expect(result.xyz).toBe(xyz);
		});
	});

	describe('properties that are null should be deleted', function() {
		var result;

		beforeEach(function(done) {
			processor.process(original)
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the original object should not have an "xyz.a" property', function() {
			expect(result.xyz.hasOwnProperty('a')).toEqual(false);
		});
	});

	describe('properties that are undefined should be deleted', function() {
		var result;

		beforeEach(function(done) {
			processor.process(original)
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the original object should not have an "xyz.b" property', function() {
			expect(result.hasOwnProperty('xyz.b')).toEqual(false);
		});
	});

	describe('properties that are numbers should not be affected', function() {
		var result;

		beforeEach(function(done) {
			processor.process(original)
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the original object should have an "xyz.c" property', function() {
			expect(result.xyz.c).toEqual(3);
		});
	});

	describe('properties that are numbers should not be affected', function() {
		var result;

		beforeEach(function(done) {
			processor.process(original)
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the original object should have an "d" property', function() {
			expect(result.xyz.d).toEqual('four');
		});
	});

	describe('properties that are objects should not be affected', function() {
		var result;

		beforeEach(function(done) {
			processor.process(original)
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the original object should have an "xyz.e" property', function() {
			expect(result.xyz.e).toBe(e);
		});
	});

	describe('properties that are arrays should not be affected', function() {
		var result;

		beforeEach(function(done) {
			processor.process(original)
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the original object should have an "xyz.f" property', function() {
			expect(result.xyz.f).toBe(f);
		});
	});
});

describe('When a CleanResultProcessor is used on a single property (that is null)', function() {
	'use strict';

	var processor;
	var original;

	var xyz;
	var e;
	var f;

	beforeEach(function() {
		processor = new CleanResultProcessor({ propertyName: 'abc' });

		original = {
			abc: null,
			xyz: xyz = {
				a: null,
				b: undefined,
				c: 3,
				d: 'four',
				e: e = {},
				f: f = []
			}
		};
	});

	describe('the wrapper property should be unaffected', function() {
		var result;

		beforeEach(function(done) {
			processor.process(original)
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('the original object should be returned', function() {
			expect(result).toBe(original);
		});

		it('the original object should not have an "abc" property', function() {
			expect(result.hasOwnProperty('abc')).toEqual(false);
		});

		it('the original object should have an "xyz" property', function() {
			expect(result.xyz).toBe(xyz);
		});
	});
});