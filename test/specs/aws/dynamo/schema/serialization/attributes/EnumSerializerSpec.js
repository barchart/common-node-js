var Enum = require('@barchart/common-js/lang/Enum');

var EnumSerializer = require('./../../../../../../../aws/dynamo/schema/serialization/attributes/EnumSerializer');

describe('When a EnumSerializer is instantiated (for a MotorcycleType enum)', function() {
	'use strict';

	class MotorcycleType extends Enum {
		constructor(code, description) {
			super(code, description);
		}

		static get CHOPPER() {
			return chopper;
		}

		static get TOURING() {
			return touring;
		}
	}

	const chopper = new MotorcycleType('CH', 'Chopper');
	const touring = new MotorcycleType('T', 'Touring');

	var serializer;

	beforeEach(function() {
		serializer = new EnumSerializer(MotorcycleType);
	});

	it('it serializes a MotorcycleType.CHOPPER as { S: "CH" } }', function() {
		var serialized = serializer.serialize(MotorcycleType.CHOPPER);

		expect(serialized.S).toEqual('CH');
	});

	it('it deserializes { S: "CH" } as MotorcycleType.CHOPPER', function() {
		var deserialized = serializer.deserialize({ S: 'CH' });

		expect(deserialized).toBe(MotorcycleType.CHOPPER);
	});
});