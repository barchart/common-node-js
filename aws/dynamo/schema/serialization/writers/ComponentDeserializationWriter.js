const assert = require('common/lang/assert'),
	is = require('common/lang/is');

const Component = require('./../../definitions/Component'),
	Serializers = require('./../Serializers');

const Writer = require('./Writer');

module.exports = (() => {
	'use strict';

	class ComponentDeserializationWriter extends Writer {
		constructor(component) {
			super();

			assert.argumentIsRequired(component, 'component', Component, 'Component');

			this._component = component;
			this._serializer = Serializers.forComponent(component);
		}

		_write(source, target) {
			const name = this._attribute.name;
			const definitions = this._component.componentType.definitions;

			const values = definitions.map((definition) => {
				const componentName = definition.getFieldName(name);

				return source[componentName];
			});

			target[name] = this._serializer.deserialize(values);
		}

		_canTranslate(source, target) {
			return this._serializer !== null && is.object(source);
		}

		toString() {
			return '[ComponentDeserializationWriter]';
		}
	}

	return ComponentDeserializationWriter;
})();