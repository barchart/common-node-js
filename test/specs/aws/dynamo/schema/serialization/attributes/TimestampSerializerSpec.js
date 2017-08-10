var Timestamp = require('common/lang/Timestamp');

var TimestampSerializer = require('./../../../../../../../aws/dynamo/schema/serialization/attributes/TimestampSerializer');

describe('When a TimestampSerializer is instantiated', function() {
	'use strict';

	var serializer;

	beforeEach(function() {
		serializer = new TimestampSerializer();
	});

	it('it serializes a Timestamp instance (with a value of 1502377780551) as { N: "1502377780551" } }', function() {
		var serialized = serializer.serialize(new Timestamp(1502377780551));

		expect(serialized.N).toEqual('1502377780551');
	});

	it('it deserializes { N: "1502377780551" } as a Timestamp instance with the correct value', function() {
		var deserialized = serializer.deserialize({ N: "1502377780551" });

		expect(deserialized && (deserialized instanceof Timestamp) && deserialized.timestamp).toEqual(1502377780551);
	});
});