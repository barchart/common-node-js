var NullCoalescingResultProcessor = require('./../../../../data/processors/NullCoalescingResultProcessor');

describe('When a NullCoalescingResultProcessor is created', function() {
	'use strict';

	var processor;
	var configuration;

	beforeEach(function() {
		processor = new NullCoalescingResultProcessor(configuration = { propertyName: 'testProperty', replaceValue: 'testValue' });
	});

	it('and a target object with a null property is processed', function() {
		var target;

		beforeEach(function() {
			processor.process(target = { testProperty: null });
		});

		it('should assign the coalesced value to the target property', function() {
			expect(target.testProperty).toEqual('testValue');
		});
	});

	it('and a target object with a non-null property is processed', function() {
		var target;

		beforeEach(function() {
			processor.process(target = { testProperty: 'bob' });
		});

		it('should assign the coalesced value to the target property', function() {
			expect(target.testProperty).toEqual('bob');
		});
	});

	it('and a target object without the property is processed', function() {
		var target;

		beforeEach(function() {
			processor.process(target = { });
		});

		it('should assign the coalesced value to the target property', function() {
			expect(target.hasOwnProperty('testProperty')).toEqual(false);
		});
	});
});