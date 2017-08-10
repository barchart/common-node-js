var NumberSerializer = require('./../../../../../../../aws/dynamo/schema/serialization/attributes/NumberSerializer');

describe('When a NumberSerializer is instantiated', function() {
	'use strict';

	var serializer;

	beforeEach(function() {
		serializer = new NumberSerializer();
	});

	it('it serializes 3 as { "N": 3 }', function() {
		var serialized = serializer.serialize(3);

		expect(serialized.N).toEqual('3');
	});

	it('it deserializes { "N": 3 } as 3', function() {
		var deserialized = serializer.deserialize({ N: '3' });

		expect(deserialized).toEqual(3);
	});
});