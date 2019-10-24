var { MapSerializer } = require('../../../../../../../aws/dynamo/schema/serialization/attributes/NestedSerializers');

describe('When a MapSerializer is instantiated', function() {
	'use strict';

	var serializer;

	beforeEach(function() {
		serializer = new MapSerializer();
	});

	it('it serializes { "Name": "Joe", "Age": 35 } as { "M": {"Name": {"S": "Joe"}, "Age": {"N": "35"}} }', function() {
		var serialized = serializer.serialize({ Name: 'Joe', Age: 35 });

		expect(serialized.M).toEqual({ Name: { S: 'Joe' }, Age: { N: '35' } });
	});

	it('it deserializes { "M": {"Name": {"S": "Joe"}, "Age": {"N": "35"}} } as { "Name": "Joe", "Age": 35 }', function() {
		var deserialized = serializer.deserialize({ M: { Name: { S: 'Joe' }, Age: { N: 35 } } });

		expect(deserialized).toEqual({ Name: 'Joe', Age: 35 });
	});
});
