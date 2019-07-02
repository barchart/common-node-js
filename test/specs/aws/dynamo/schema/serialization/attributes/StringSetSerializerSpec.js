var StringSetSerializer = require('./../../../../../../../aws/dynamo/schema/serialization/attributes/StringSetSerializer');

describe('When a StringSetSerializer is instantiated', function() {
	'use strict';

	var serializer;

	beforeEach(function() {
		serializer = new StringSetSerializer();
	});

	it('it serializes ["one", "two"] as { "SS": ["one", "two"] }', function() {
		var serialized = serializer.serialize(['one', 'two']);

		expect(serialized.SS).toEqual(['one', 'two']);
	});

	it('it deserializes { "SS": ["one", "two"] } as ["one", "two"]', function() {
		var deserialized = serializer.deserialize({ SS: ['one', 'two'] });

		expect(deserialized).toEqual(['one', 'two']);
	});
});
