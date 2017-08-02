const assert = require('common/lang/assert');

const Attribute = require('./Attribute'),
	ComponentTypeDefinition = require('./ComponentTypeDefinition');

module.exports = (() => {
	'use strict';

	class ComponentItem {
		constructor(attribute, definition) {
			assert.argumentIsRequired(attribute, 'attribute', Attribute, 'Attribute');
			assert.argumentIsRequired(definition, 'definition', ComponentTypeDefinition, 'ComponentTypeDefinition');

			this._attribute = attribute;
			this._definition = definition;
		}

		get attribute() {
			return this._attribute;
		}

		get definition() {
			return this._definition;
		}

		toString() {
			return `[ComponentItem]`;
		}
	}

	return ComponentItem;
})();