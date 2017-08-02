const assert = require('common/lang/assert');

const Attribute = require('./../definitions/Attribute'),
	Component = require('./../definitions/Component'),
	ComponentItem = require('./../definitions/ComponentItem');
	ComponentType = require('./../definitions/ComponentType');

module.exports = (() => {
	'use strict';

	/**
	 * Fluent interface for building a {@link Component}.
	 *
	 * @public
	 * @param {string} name
	 * @param {TableBuilder} parent
	 */
	class ComponentBuilder {
		constructor(name, parent, alias) {
			assert.argumentIsRequired(name, 'name', String);
			assert.argumentIsOptional(alias, 'alias', String);

			this._component = new Component(name, alias, null);
			this._parent = parent;
		}

		/**
		 * The {@link Component}, given all the information provided thus far.
		 *
		 * @public
		 */
		get component() {
			return this._component;
		}

		/**
		 * Set the {@link ComponentType}, generates {@link Attributes} as necessary, and returns the
		 * current instance.
		 *
		 * @public
		 * @param {ComponentType} componentType
		 * @returns {ComponentBuilder}
		 */
		withComponentType(componentType) {
			assert.argumentIsRequired(componentType, 'componentType', ComponentType, 'ComponentType');

			const items = componentType.definitions.map((ctd) => {
				const attribute = getOrCreateAttribute(this.component, ctd, this._parent);

				return new ComponentItem(attribute, ctd);
			});

			this._component = new Component(this._component.name, componentType, this._component.componentItems);

			return this;
		}

		toString() {
			return '[ComponentBuilder]';
		}
	}

	function getOrCreateAttribute(component, componentTypeDefinition, parent) {
		const name = componentTypeDefinition.getFieldName(component.name);

		if (!parent.table.attributes.some(a => a.name === name)) {
			parent.withAttributeBuilder(name, (ab) => {
				ab.withDataType(componentTypeDefinition.dataType);
			});
		}

		return parent.table.attributes.find(a => a.name === name);
	}

	return ComponentBuilder;
})();