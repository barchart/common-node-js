var JsonSerializer = require('./../../../../../../../aws/dynamo/schema/serialization/attributes/JsonSerializer');

describe('When a JsonSerializer is instantiated', function() {
	'use strict';

	var serializer;

	beforeEach(function() {
		serializer = new JsonSerializer();
	});

	it('it serializes { cat: "black" } as { "S": "{\"cat\":\"black\" }" }', function() {
		var serialized = serializer.serialize({ cat: "black" });

		expect(serialized.S).toEqual('{"cat":"black"}');
	});

	it('it deserializes { "S": "{\"cat\":\"black\" } as { cat: "black" }', function() {
		var deserialized = serializer.deserialize({ S: '{"cat":"black"}' });

		expect(deserialized && deserialized.hasOwnProperty('cat') && deserialized.cat).toEqual('black');
	});
});