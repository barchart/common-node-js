var UppercaseResultProcessor = require('./../../../../data/processors/UppercaseResultProcessor');

describe('When a UppercaseResultProcessor is used on a string-based property', function() {
	'use strict';

	var processor;

	beforeEach(function() {
		processor = new UppercaseResultProcessor({ propertyName: 'volume' });
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

		it('the object should not have a "volume" property defined', function() {
			expect(result.hasOwnProperty('volume')).toEqual(false);
		});
	});

	describe('and the property value has no lowercase letters', function() {
		var result;
		var original;

		beforeEach(function(done) {
			processor.process(original = { volume: 'LOUD' })
				.then(function(r) {
					result = r;
					done();
				});
		});

		it('the original object should be returned', function() {
			expect(result).toBe(original);
		});

		it('the "volume" property value should be unchanged', function() {
			expect(result.volume).toEqual('LOUD');
		});
	});

	describe('and the property value has lower letters', function() {
		var result;
		var original;

		beforeEach(function(done) {
			processor.process(original = { volume: 'quiet' })
				.then(function(r) {
					result = r;
					done();
				});
		});

		it('the original object should be returned', function() {
			expect(result).toBe(original);
		});

		it('the "volume" property value should be changed to lowercase', function() {
			expect(result.volume).toEqual('QUIET');
		});
	});

	describe('and the property value is not a string', function() {
		var result;
		var original;
		var volume;

		beforeEach(function(done) {
			processor.process(original = { volume: volume = { decibels: 110 } })
				.then(function(r) {
					result = r;
					done();
				});
		});

		it('the original object should be returned', function() {
			expect(result).toBe(original);
		});

		it('the "volume" property value should not be changed', function() {
			expect(result.volume).toBe(volume);
		});
	});
});