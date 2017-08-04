const assert = require('common/lang/assert'),
	is = require('common/lang/is');

const Attribute = require('./../../schema/definitions/Attribute'),
	Component = require('./../../schema/definitions/Component'),
	ComponentType = require('./../../schema/definitions/ComponentType'),
	DataType = require('./../../schema/definitions/DataType');

const JsonSerializer = require('./attributes/JsonSerializer'),
	NumberSerializer = require('./attributes/NumberSerializer'),
	StringSerializer = require('./attributes/StringSerializer');

const MoneySerializer = require('./components/MoneySerializer');

module.exports = (() => {
	'use strict';

	class Serializers {
		constructor() {

		}

		static forAttribute(attribute) {
			assert.argumentIsRequired(attribute, 'attribute', Attribute, 'Attribute');

			return Serializers.forDataType(attribute.dataType);
		}

		static forDataType(dataType) {
			assert.argumentIsRequired(dataType, 'dataType', DataType, 'DataType');

			return serializers.get(dataType) || null;
		}

		static forComponent(component) {
			assert.argumentIsRequired(component, 'component', Component, 'Component');

			return Serializers.forComponentType(component.componentType);
		}

		static forComponentType(componentType) {
			assert.argumentIsRequired(componentType, 'componentType', Component, 'Component');

			return components.get(componentType) || null;
		}

		toString() {
			return '[Serializers]';
		}
	}

	const serializers = new Map();

	serializers.set(DataType.NUMBER, new NumberSerializer());
	serializers.set(DataType.STRING, new StringSerializer());
	serializers.set(DataType.JSON, new JsonSerializer());

	const components = new Map();

	components.add(ComponentType.MONEY, new MoneySerializer());

	return Serializers;
})();