var StringSerializer = require('./../../../../../../../aws/dynamo/schema/serialization/attributes/StringSerializer');

describe('When a StringSerializer is instantiated', function() {
	'use strict';

	var serializer;

	beforeEach(function() {
		serializer = new StringSerializer();
	});

	it('it serializes "three" as { "S": "three" }', function() {
		var serialized = serializer.serialize("three");

		expect(serialized.S).toEqual('three');
	});

	it('it deserializes { "S": "three" } as "three"', function() {
		var deserialized = serializer.deserialize({ S: 'three' });

		expect(deserialized).toEqual('three');
	});
});