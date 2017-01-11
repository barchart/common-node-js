var CompositeResultProcessor = require('./../../../../data/processors/CompositeResultProcessor');
var ResultProcessor = require('./../../../../data/ResultProcessor');

describe('When a CompositeResultProcessor is created with two children', function() {
	'use strict';

	var processor;

	var childProcessorOne;
	var childProcessorTwo;

	var spyOne;
	var spyTwo;

	var processResultOne;
	var processResultTwo;

	class ResultProcessorSpy extends ResultProcessor {
		constructor(spy) {
			super();

			this._spy = spy;
		}

		_process(results) {
			return this._spy(results);
		}
	}

	beforeEach(function() {
		childProcessorOne = new ResultProcessorSpy(spyOne = jasmine.createSpy('spyOne').and.returnValue(processResultOne = { }));
		childProcessorTwo = new ResultProcessorSpy(spyTwo = jasmine.createSpy('spyTwo').and.returnValue(processResultTwo = { }));

		processor = new CompositeResultProcessor([ childProcessorOne, childProcessorTwo ]);
	});

	describe('and the processor is invoked', function() {
		var result;
		var original;

		beforeEach(function(done) {
			processor.process(original = { })
				.then(function(r) {
					result = r;

					done();
				});
		});

		it('should pass the original context to first child provider', function() {
			expect(spyOne).toHaveBeenCalledWith(original);
		});

		it('should pass the result of the first child provider to the second child provider', function() {
			expect(spyTwo).toHaveBeenCalledWith(processResultOne);
		});

		it('should return the result of the second child provider', function() {
			expect(result).toBe(processResultTwo);
		});
	});
});