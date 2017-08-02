const assert = require('common/lang/assert');

const ComponentTypeDefinition = require('./ComponentTypeDefinition'),
	DataType = require('./DataType');

module.exports = (() => {
	'use strict';

	/**
	 * Defines the items that compose a component.
	 *
	 * @public
	 * @param {String} description
	 * @param {Array<ComponentTypeDefinition>} definitions
	 */
	class ComponentType {
		constructor(description, definitions) {
			assert.argumentIsRequired(description, 'description', String);
			assert.argumentIsArray(definitions, 'definitions', ComponentTypeDefinition, 'ComponentTypeDefinition');

			if (definitions.length < 1) {
				throw new Error('The "definitions" array cannot be empty.');
			}

			this._description = description;
			this._definitions = definitions;
		}

		/**
		 * A description of the component type.
		 *
		 * @public
		 * @returns {*}
		 */
		get description() {
			return this._description;
		}

		/**
		 * Definition for the items that form a component.
		 *
		 * @public
		 * @returns {ComponentTypeDefinition[]}
		 */
		get definitions() {
			return this._definitions;
		}

		/**
		 * The component type for amount -- using a fixed precisions -- combined with a currency.
		 *
		 * @public
		 * @returns {ComponentType}
		 */
		static get MONEY() {
			return componentTypeAmount;
		}

		/**
		 * Returns the definition for a field with a given description.
		 *
		 * @public
		 * @param {String} description
		 * @returns {ComponentTypeDefinition|null}
		 */
		getDefinition(description) {
			return this._definitions.find(ctd => ctd.description === description) || null;
		}

		/**
		 * The component type for a price, combining fields for
		 * the price's value and the currency.
		 *
		 * @public
		 * @returns {ComponentType}
		 */
		static get PRICE() {
			return componentTypePrice;
		}

		toString() {
			return `[ComponentType (description=${this._description})]`;
		}
	}

	const componentTypeAmount = new ComponentType('Money', [
		new ComponentTypeDefinition('amount', DataType.STRING, 'amount'),
		new ComponentTypeDefinition('currency', DataType.STRING, 'currency')
	]);

	const componentTypePrice = new ComponentType('Price', [
		new ComponentTypeDefinition('amount', DataType.STRING, 'amount'),
		new ComponentTypeDefinition('currency', DataType.STRING, 'currency')
	]);

	return ComponentType;
})();