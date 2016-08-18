var NullCoalescingResultProcessor = require('./../../../../data/processors/NullCoalescingResultProcessor');

describe('When a NullCoalescingResultProcessor is created', function() {
	'use strict';

	var processor;
	var configuration;

	beforeEach(function() {
		processor = new NullCoalescingResultProcessor(configuration = { propertyName: 'testProperty', replaceValue: 'testValue' });
	});

	describe('and a target object with a null property is processed', function() {
		var target;

		beforeEach(function(done) {
			processor.process(target = { testProperty: null })
				.then(function(r) {
					done();
				});
		});

		it('should assign the coalesced value to the target property', function() {
			expect(target.testProperty).toEqual('testValue');
		});
	});

	describe('and a target object with a non-null property is processed', function() {
		var target;

		beforeEach(function(done) {
			processor.process(target = { testProperty: 'bob' })
				.then(function(r) {
					done();
				});
		});

		it('should assign the coalesced value to the target property', function() {
			expect(target.testProperty).toEqual('bob');
		});
	});

	describe('and a target object without the property is processed', function() {
		var target;

		beforeEach(function(done) {
			processor.process(target = { })
				.then(function(r) {
					done();
				});
		});

		it('should assign the coalesced value to the target property', function() {
			expect(target.hasOwnProperty('testProperty')).toEqual(false);
		});
	});
});