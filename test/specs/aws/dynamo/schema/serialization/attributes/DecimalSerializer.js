var Decimal = require('common/lang/Decimal');

var DecimalSerializer = require('./../../../../../../../aws/dynamo/schema/serialization/attributes/DecimalSerializer');

describe('When a Decimal Serializer is instantiated', function() {
	'use strict';

	var serializer;

	beforeEach(function() {
		serializer = new DecimalSerializer();
	});

	it('it serializes a Decimal instance (with a value of 3.1416) as { S: "3.1416" } }', function() {
		var serialized = serializer.serialize(new Decimal(3.1416));

		expect(serialized.S).toEqual('3.1416');
	});

	it('it deserializes { S: "3.1416" } as a Decimal with a value of 3.1416', function() {
		var deserialized = serializer.deserialize({ S: '3.1416' });

		expect(deserialized && (deserialized instanceof Decimal) && deserialized.toFixed()).toEqual('3.1416');
	});
});