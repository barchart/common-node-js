var TrimResultProcessor = require('./../../../../data/processors/TrimResultProcessor');

describe('When a TrimResultProcessor is used on a string-based property', function() {
	'use strict';

	var processor;

	beforeEach(function() {
		processor = new TrimResultProcessor({ propertyName: 'hair' });
	});

	describe('and the property does not exist', function() {
		var result;
		var original;

		beforeEach(function(done) {
			processor.process(original = { })
				.then(function(r) {
					result = r;
					done();
				});
		});

		it('the original object should be returned', function() {
			expect(result).toBe(original);
		});

		it('the object should not have a "hair" property defined', function() {
			expect(result.hasOwnProperty('hair')).toEqual(false);
		});
	});

	describe('and the property value has no leading or trailing spaces', function() {
		var result;
		var original;

		beforeEach(function(done) {
			processor.process(original = { hair: 'yes' })
				.then(function(r) {
					result = r;
					done();
				});
		});

		it('the original object should be returned', function() {
			expect(result).toBe(original);
		});

		it('the "hair" property value should be unchanged', function() {
			expect(result.hair).toEqual('yes');
		});
	});

	describe('and the property value has leading and trailing spaces', function() {
		var result;
		var original;

		beforeEach(function(done) {
			processor.process(original = { hair: ' club for men ' })
				.then(function(r) {
					result = r;
					done();
				});
		});

		it('the original object should be returned', function() {
			expect(result).toBe(original);
		});

		it('the "hair" property value should be trimmed', function() {
			expect(result.hair).toEqual('club for men');
		});
	});

	describe('and the property value is a single space', function() {
		var result;
		var original;

		beforeEach(function(done) {
			processor.process(original = { hair: ' ' })
				.then(function(r) {
					result = r;
					done();
				});
		});

		it('the original object should be returned', function() {
			expect(result).toBe(original);
		});

		it('the "hair" property value should be a zero-length string', function() {
			expect(result.hair).toEqual('');
		});
	});
});