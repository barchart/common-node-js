var Serializer = require('./../../../../../../aws/dynamo/schema/serialization/Serializer');

var TableBuilder = require('./../../../../../../aws/dynamo/schema/builders/TableBuilder');
var DataType = require('./../../../../../../aws/dynamo/schema/definitions/DataType');
var KeyType = require('./../../../../../../aws/dynamo/schema/definitions/KeyType');

describe('When a Serializer with a table that has "firstName" and "age" attributes', function() {
	'use strict';

	var table;

	beforeEach(function() {
		var builder = TableBuilder.withName('irrelevant')
			.withAttribute('firstName', DataType.STRING)
			.withAttribute('age', DataType.NUMBER)
			.withKey('firstName', KeyType.HASH);

		table = builder.table;
	});

	describe('and { firstName: "Imogen", age: 3 } is serialized', function() {
		var serialized;

		beforeEach(function() {
			serialized = Serializer.serialize({ firstName: 'Imogen', age: 3}, table);
		});

		it('should have an "Item.firstName.S" property with a value of "Imogen"', function() {
			expect(serialized.Item && serialized.Item.firstName && serialized.Item.firstName.S).toEqual("Imogen");
		});

		it('should have an "Item.age.N" property with a value of "3"', function() {
			expect(serialized.Item && serialized.Item.age && serialized.Item.age.N).toEqual("3");
		});
	});
});