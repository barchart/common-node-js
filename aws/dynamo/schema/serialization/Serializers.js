const assert = require('@barchart/common-js/lang/assert');

const Attribute = require('./../../schema/definitions/Attribute'),
	Component = require('./../../schema/definitions/Component'),
	ComponentType = require('./../../schema/definitions/ComponentType'),
	DataType = require('./../../schema/definitions/DataType');

const AttributeSerializer = require('./attributes/AttributeSerializer'),
	BinarySerializer = require('./attributes/BinarySerializer'),
	BooleanSerializer = require('./attributes/BooleanSerializer'),
	DaySerializer = require('./attributes/DaySerializer'),
	DecimalSerializer = require('./attributes/DecimalSerializer'),
	EnumSerializer = require('./attributes/EnumSerializer'),
	JsonSerializer = require('./attributes/JsonSerializer'),
	NumberSerializer = require('./attributes/NumberSerializer'),
	StringSerializer = require('./attributes/StringSerializer'),
	TimestampSerializer = require('./attributes/TimestampSerializer');

const CompressedBinarySerializer = require('./attributes/CompressedBinarySerializer'),
	CompressedJsonSerializer = require('./attributes/CompressedJsonSerializer'),
	CompressedStringSerializer = require('./attributes/CompressedStringSerializer');

const ComponentSerializer = require('./components/ComponentSerializer'),
	MoneySerializer = require('./components/MoneySerializer');

module.exports = (() => {
	'use strict';

	/**
	 * Utility for looking up {@link AttributeSerializer} and {@link ComponentSerializer}
	 * instances. (no instance-level functionality exists -- static functions only).
	 *
	 * @public
	 */
	class Serializers {
		constructor() {

		}

		/**
		 * Binds a {@link DataType} to an {@link AttributeSerializer}, allowing the underlying framework
		 * to automatically handle the a custom attribute type.
		 *
		 * @param {DataType} serializer
		 * @param {AttributeSerializer} serializer
		 */
		static registerAttributeSerializer(dataType, serializer) {
			assert.argumentIsRequired(dataType, 'dataType', DataType, 'DataType');
			assert.argumentIsRequired(serializer, 'serializer', AttributeSerializer, 'AttributeSerializer');
			
			if (attributeSerializers.has(dataType)) {
				throw new Error('An attribute serializer has already been registered for the data type (' + dataType.toString() + ')');
			}

			attributeSerializers.set(dataType, serializer);
		}
		
		/**
		 * Returns the appropriate {@link AttributeSerializer} given an {@link Attribute}.
		 *
		 * @param {Attribute} attribute
		 * @returns {AttributeSerializer|null}
		 */
		static forAttribute(attribute) {
			assert.argumentIsRequired(attribute, 'attribute', Attribute, 'Attribute');

			return Serializers.forDataType(attribute.dataType);
		}

		/**
		 * Returns the appropriate {@link AttributeSerializer} given a {@link DataType}.
		 *
		 * @param {DataType} dataType
		 * @returns {AttributeSerializer|null}
		 */
		static forDataType(dataType) {
			assert.argumentIsRequired(dataType, 'dataType', DataType, 'DataType');

			const enumerationType = dataType.enumerationType;

			let returnRef;

			if (enumerationType) {
				if (!enumSerializers.has(enumerationType)) {
					enumSerializers.set(enumerationType, new EnumSerializer(enumerationType));
				}

				returnRef = enumSerializers.get(enumerationType);
			} else {
				returnRef = attributeSerializers.get(dataType);
			}

			return returnRef || null;
		}

		/**
		 * Binds a {@link DataType} to a {@link ComponentSerializer}, allowing the underlying framework
		 * to automatically handle the a custom attribute type.
		 *
		 * @param {ComponentType} serializer
		 * @param {ComponentSerializer} serializer
		 */
		static registerComponentSerializer(componentType, serializer) {
			assert.argumentIsRequired(componentType, 'componentType', ComponentType, 'ComponentType');
			assert.argumentIsRequired(serializer, 'serializer', ComponentSerializer, 'ComponentSerializer');

			if (componentSerializers.has(componentType)) {
				throw new Error('A component serializer has already been registered for the component type (' + componentType.toString() + ')');
			}

			componentSerializers.set(componentType, serializer);
		}
		
		/**
		 * Returns the appropriate {@link ComponentSerializer} given a {@link Component}.
		 *
		 * @param {Component} component
		 * @returns {ComponentSerializer|null}
		 */
		static forComponent(component) {
			assert.argumentIsRequired(component, 'component', Component, 'Component');

			return Serializers.forComponentType(component.componentType);
		}

		/**
		 * Returns the appropriate {@link ComponentSerializer} given a {@link ComponentType}.
		 *
		 * @param {ComponentType} componentType
		 * @returns {ComponentSerializer|null}
		 */
		static forComponentType(componentType) {
			assert.argumentIsRequired(componentType, 'componentType', ComponentType, 'ComponentType');

			return componentSerializers.get(componentType) || null;
		}

		toString() {
			return '[Serializers]';
		}
	}

	const enumSerializers = new Map();
	const attributeSerializers = new Map();
	const componentSerializers = new Map();

	Serializers.registerAttributeSerializer(DataType.BINARY, BinarySerializer.INSTANCE);
	Serializers.registerAttributeSerializer(DataType.BOOLEAN, BooleanSerializer.INSTANCE);
	Serializers.registerAttributeSerializer(DataType.NUMBER, NumberSerializer.INSTANCE);
	Serializers.registerAttributeSerializer(DataType.STRING, StringSerializer.INSTANCE);
	Serializers.registerAttributeSerializer(DataType.JSON, JsonSerializer.INSTANCE);
	Serializers.registerAttributeSerializer(DataType.DAY, DaySerializer.INSTANCE);
	Serializers.registerAttributeSerializer(DataType.DECIMAL, DecimalSerializer.INSTANCE);
	Serializers.registerAttributeSerializer(DataType.TIMESTAMP, TimestampSerializer.INSTANCE);
	Serializers.registerAttributeSerializer(DataType.BINARY_COMPRESSED, CompressedBinarySerializer.INSTANCE);
	Serializers.registerAttributeSerializer(DataType.STRING_COMPRESSED, CompressedStringSerializer.INSTANCE);
	Serializers.registerAttributeSerializer(DataType.JSON_COMPRESSED, CompressedJsonSerializer.INSTANCE);

	Serializers.registerComponentSerializer(ComponentType.MONEY, MoneySerializer.INSTANCE);

	return Serializers;
})();