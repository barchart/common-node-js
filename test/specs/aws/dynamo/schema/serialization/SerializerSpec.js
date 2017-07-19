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

		it('the result should have an "firstName.S" property with a value of "Imogen"', function() {
			expect(serialized.firstName && serialized.firstName.S).toEqual("Imogen");
		});

		it('the result should have an "age.N" property with a value of "3"', function() {
			expect(serialized.age && serialized.age.N).toEqual("3");
		});
	});

	describe('and { firstName: { S: "Imogen" }, age: { N: "3" } } is deserialized', function() {
		var deserialized;

		beforeEach(function() {
			deserialized = Serializer.deserialize({ firstName: { S: 'Imogen' }, age: { N: '3' } }, table);
		});

		it('the result "firstName" property with a value of "Imogen"', function() {
			expect(deserialized && deserialized.firstName).toEqual("Imogen");
		});

		it('the result an "age" property with a value of 3', function() {
			expect(deserialized && deserialized.age).toEqual(3);
		});
	});
});