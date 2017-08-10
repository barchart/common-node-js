var BooleanSerializer = require('./../../../../../../../aws/dynamo/schema/serialization/attributes/BooleanSerializer');

describe('When a BooleanSerializer is instantiated', function() {
	'use strict';

	var serializer;

	beforeEach(function() {
		serializer = new BooleanSerializer();
	});

	it('it serializes true as { "BOOL": true }', function() {
		var serialized = serializer.serialize(true);

		expect(serialized.BOOL).toEqual(true);
	});

	it('it deserializes { "BOOL": true } as true', function() {
		var deserialized = serializer.deserialize({ BOOL: true });

		expect(deserialized).toEqual(true);
	});
});