var LowercaseResultProcessor = require('./../../../../data/processors/LowercaseResultProcessor');

describe('When a LowercaseResultProcessor is used on a string-based property', function() {
	'use strict';

	var processor;

	beforeEach(function() {
		processor = new LowercaseResultProcessor({ propertyName: 'volume' });
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

	describe('and the property value has no uppercase letters', function() {
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

		it('the "volume" property value should be unchanged', function() {
			expect(result.volume).toEqual('quiet');
		});
	});

	describe('and the property value has uppercase letters', function() {
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

		it('the "volume" property value should be changed to lowercase', function() {
			expect(result.volume).toEqual('loud');
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