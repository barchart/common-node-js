var ListSerializer = require('./../../../../../../../aws/dynamo/schema/serialization/attributes/ListSerializer');

describe('When a ListSerializer is instantiated', function() {
	'use strict';

	var serializer;

	beforeEach(function() {
		serializer = new ListSerializer();
	});

	it('it serializes ["123", 2] as { "L": [ { "S": "String 1" }, { "N": "2" } ] }', function() {
		var serialized = serializer.serialize(['String 1', 2]);

		expect(serialized.L).toEqual([ { S: 'String 1' }, { N: '2' } ]);
	});

	it('it deserializes { "L": [ { "S": "String 1" }, { "N": "2" } ] } as ["123", 2]', function() {
		var deserialized = serializer.deserialize({ L: [ { S: 'String 1' }, { N: '2' } ] });

		expect(deserialized).toEqual(['String 1', 2]);
	});
});
