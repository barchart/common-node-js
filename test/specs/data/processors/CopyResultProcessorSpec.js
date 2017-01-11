var CopyResultProcessor = require('./../../../../data/processors/CopyResultProcessor');

describe('When a CopyResultProcessor is created, copying one property to another ("a" to "b")', function() {
	'use strict';

	var processor;

	beforeEach(function () {
		processor = new CopyResultProcessor({sourcePropertyName: 'a', targetPropertyName: 'b'});
	});

	describe('and an object with an "b" property is processed', function () {
		var result;
		var original;

		beforeEach(function (done) {
			processor.process(original = {a: 1})
				.then(function (r) {
					result = r;

					done();
				});
		});

		it('the original object should be returned', function () {
			expect(result).toBe(original);
		});

		it('the "a" property should be unchanged', function () {
			expect(result.a).toEqual(1);
		});

		it('the "b" property should be added', function () {
			expect(result.hasOwnProperty('b')).toEqual(true);
		});

		it('the "b" property value should be equal to the "a" property value"', function () {
			expect(result.b).toEqual(1);
		});
	});

	describe('and an object with an "b" property, referencing an object, is passed', function () {
		var result;
		var original;

		beforeEach(function (done) {
			processor.process(original = {a: { }})
				.then(function (r) {
					result = r;

					done();
				});
		});

		it('the original object should be returned', function () {
			expect(result).toBe(original);
		});


		it('the "b" property should be added', function () {
			expect(result.hasOwnProperty('b')).toEqual(true);
		});

		it('the "b" property value should be equal to the "a" property value"', function () {
			expect(result.b).toBe(result.a);
		});
	});
});

describe('When a CopyResultProcessor is created, copying one property to another ("a" to "b"), using a regular expression', function() {
	'use strict';

	var processor;

	beforeEach(function () {
		processor = new CopyResultProcessor({sourcePropertyName: 'a', targetPropertyName: 'b', regex: '[0-9]' });
	});

	describe('and an object with an "b" property is processed', function () {
		var result;
		var original;

		beforeEach(function (done) {
			processor.process(original = {a: 'a1b2c3'})
				.then(function (r) {
					result = r;

					done();
				});
		});

		it('the original object should be returned', function () {
			expect(result).toBe(original);
		});

		it('the "a" property should be unchanged', function () {
			expect(result.a).toEqual('a1b2c3');
		});

		it('the "b" property should be added', function () {
			expect(result.hasOwnProperty('b')).toEqual(true);
		});

		it('the "b" property value should be the output of the regular expression"', function () {
			expect(result.b).toEqual('1');
		});
	});
});

describe('When a CopyResultProcessor is created, copying multiple properties to another ("a" to "b" and "c")', function() {
	'use strict';

	var processor;

	beforeEach(function () {
		processor = new CopyResultProcessor({sourcePropertyName: 'a', targetPropertyNames: ['b', 'c']});
	});

	describe('and an object with an "b" property is processed', function () {
		var result;
		var original;

		beforeEach(function (done) {
			processor.process(original = {a: 1})
				.then(function (r) {
					result = r;

					done();
				});
		});

		it('the original object should be returned', function () {
			expect(result).toBe(original);
		});

		it('the "a" property should be unchanged', function () {
			expect(result.a).toEqual(1);
		});

		it('the "b" property should be added', function () {
			expect(result.hasOwnProperty('b')).toEqual(true);
		});

		it('the "b" property value should be equal to the "a" property value"', function () {
			expect(result.b).toEqual(1);
		});

		it('the "c" property should be added', function () {
			expect(result.hasOwnProperty('c')).toEqual(true);
		});

		it('the "c" property value should be equal to the "a" property value"', function () {
			expect(result.c).toEqual(1);
		});
	});
});