var Day = require('common/lang/Day');

var DaySerializer = require('./../../../../../../../aws/dynamo/schema/serialization/attributes/DaySerializer');

describe('When a Day Serializer is instantiated', function() {
	'use strict';

	var serializer;

	beforeEach(function() {
		serializer = new DaySerializer();
	});

	it('it serializes a Day instance (with a value of December 1st, 2017) as { S: "2017-12-01" } }', function() {
		var serialized = serializer.serialize(new Day(2017, 12, 1));

		expect(serialized.S).toEqual('2017-12-01');
	});

	it('it deserializes { S: "2017-12-01" } as a Day instance for December 1st, 2017', function() {
		var deserialized = serializer.deserialize({ S: '2017-12-01' });

		expect(deserialized && (deserialized instanceof Day) && deserialized.year === 2017 && deserialized.month === 12 && deserialized.day === 1).toEqual(true);
	});
});