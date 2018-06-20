var Attribute = require('./../../../../../../../aws/dynamo/schema/definitions/Attribute'),
	CompressionType = require('./../../../../../../../aws/dynamo/schema/definitions/CompressionType'),
	DataType = require('./../../../../../../../aws/dynamo/schema/definitions/DataType');

var CompressedStringSerializer = require('./../../../../../../../aws/dynamo/schema/serialization/attributes/CompressedStringSerializer');

describe('When a CompressedStringSerializer is instantiated using the Deflate algorithm', function() {
	'use strict';

	var attribute;
	var serializer;

	beforeEach(function() {
		attribute = new Attribute('test', DataType.STRING, null, null, CompressionType.DEFLATE);
		serializer = new CompressedStringSerializer(attribute);
	});

	describe('and a string is serialized', function() {
		var string = ('abc').repeat(10);
		var serialized;

		beforeEach(function() {
			serialized = serializer.serialize(string);
		});

		it('should produce an object with a binary (i.e. "B") property', function() {
			expect(serialized.hasOwnProperty("B")).toEqual(true);
		});

		it('should produce an object with a binary (i.e. buffer) value', function() {
			expect(Buffer.isBuffer(serialized.B)).toEqual(true);
		});

		describe('and the output is deserialized', function() {
			var deserialized;

			beforeEach(function() {
				deserialized = serializer.deserialize(serialized);
			});

			it('should produce the original string', function() {
				expect(deserialized).toEqual(string);
			});
		});
	});
});

describe('When a CompressedStringSerializer is instantiated using the Zip algorithm', function() {
	'use strict';

	var attribute;
	var serializer;

	beforeEach(function() {
		attribute = new Attribute('test', DataType.STRING, null, null, CompressionType.ZIP);
		serializer = new CompressedStringSerializer(attribute);
	});

	describe('and a string is serialized', function() {
		var string = ('abc').repeat(10);
		var serialized;

		beforeEach(function() {
			serialized = serializer.serialize(string);
		});

		it('should produce an object with a binary (i.e. "B") property', function() {
			expect(serialized.hasOwnProperty("B")).toEqual(true);
		});

		it('should produce an object with a binary (i.e. buffer) value', function() {
			expect(Buffer.isBuffer(serialized.B)).toEqual(true);
		});

		describe('and the output is deserialized', function() {
			var deserialized;

			beforeEach(function() {
				deserialized = serializer.deserialize(serialized);
			});

			it('should produce the original string', function() {
				expect(deserialized).toEqual(string);
			});
		});
	});
});