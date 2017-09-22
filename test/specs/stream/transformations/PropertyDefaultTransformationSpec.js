var PropertyDefaultTransformation = require('./../../../../stream/transformations/PropertyDefaultTransformation');

describe('When a PropertyDefaultTransformation is created', function() {
	'use strict';

	describe('targeting the "zip" property (with a default value of "60606"', function () {
		var transformation;

		beforeEach(function () {
			transformation = new PropertyDefaultTransformation('60606', 'zip');
		});

		it('should not replace an existing zip property value', function() {
			expect(transformation.transform({ "zip": '60603' }).zip).toEqual('60603');
		});

		it('should replace the existing zip property value (if the value is undefined)', function() {
			expect(transformation.transform({ "zip": undefined }).zip).toEqual('60606');
		});

		it('should add the zip property if it does not exist', function() {
			expect(transformation.transform({ }).zip).toEqual('60606');
		});
	});
});