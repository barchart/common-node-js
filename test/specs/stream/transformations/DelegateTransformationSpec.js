var DelegateTransformation = require('./../../../../stream/transformations/DelegateTransformation');

describe('When a DelegateTransformation is created', function() {
	'use strict';

	describe('targeting the "letter" property', function () {
		describe('with a "canTransform" delegate that always succeeds', function () {
			var transformation;

			var canTransform;
			var transform;
			var output;

			beforeEach(function () {
				canTransform = jasmine.createSpy('canTransform').and.returnValue(true);
				transform = jasmine.createSpy('transform').and.returnValue(output = { });

				transformation = new DelegateTransformation(transform, canTransform, false);
			});

			describe('and the transformation is checked', function() {
				var target;
				var result;

				beforeEach(function() {
					result = transformation.canTransform(target = { });
				});

				it('should invoke the "canTransform" with the target', function() {
					expect(canTransform).toHaveBeenCalledWith(target);
				});

				it('should evaluate to true', function() {
					expect(result).toEqual(true);
				});
			});

			describe('and the transformation is invoked', function() {
				var target;
				var result;

				beforeEach(function() {
					result = transformation.transform(target = { });
				});

				it('should invoke the "transform" with the target', function() {
					expect(canTransform).toHaveBeenCalledWith(target);
				});

				it('should return the result of the "transform" delegate', function() {
					expect(result).toBe(output);
				});
			});
		});
	});
});