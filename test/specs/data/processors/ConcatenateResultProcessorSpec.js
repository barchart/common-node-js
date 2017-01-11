var ConcatenateResultProcessor = require('./../../../../data/processors/ConcatenateResultProcessor');

describe('When a ConcatenateResultProcessor is created, the following source pattern [ "name.first", " The Great" ]', function() {
	'use strict';

	var processor;

	beforeEach(function() {
		processor = new ConcatenateResultProcessor({ propertyName: 'name.full', source: [ 'name.first', ' The Great' ] });
	});

	describe('and an object with a "name.first" property is processed', function() {
		var result;
		var original;

		beforeEach(function(done) {
			processor.process(original = { name: { first: 'Bryan' } })
				.then(function(r) {
					result = r;
					done();
				});
		});

		it('the original object should be returned', function() {
			expect(result).toBe(original);
		});

		it('the "name.first" property should be unchanged', function() {
			expect(result.name.first).toEqual('Bryan');
		});

		it('the a "name.full" property should be added', function() {
			expect(result.name.hasOwnProperty('full')).toEqual(true);
		});

		it('the "name.full" property value should equal "Bryan The Great"', function() {
			expect(result.name.full).toEqual("Bryan The Great");
		});
	});

	describe('and an object without a "name.first" property is processed', function() {
		var result;
		var original;

		beforeEach(function(done) {
			processor.process(original = { name: { last: 'Ingle' } })
				.then(function(r) {
					result = r;
					done();
				});
		});

		it('the original object should be returned', function() {
			expect(result).toBe(original);
		});

		it('the a "name.full" property should be added', function() {
			expect(result.name.hasOwnProperty('full')).toEqual(true);
		});

		it('the "name.full" property value should equal "Bryan The Great"', function() {
			expect(result.name.full).toEqual("name.first The Great");
		});
	});
});