const assert = require('common/lang/assert'),
	is = require('common/lang/is');

const ComponentType = require('./ComponentType'),
	ComponentItem = require('./ComponentItem');

module.exports = (() => {
	'use strict';

	/**
	 * A group of {@link Attribute} instances that are logically related.
	 *
	 * @public
	 */
	class Component {
		constructor(name, alias, componentType, componentItems) {
			this._name = name;
			this._alias = alias || name;
			this._componentType = componentType;
			this._componentItems = componentItems || [ ];
		}

		/**
		 * Name of the component.
		 *
		 * @public
		 * @returns {String}
		 */
		get name() {
			return this._name;
		}

		/**
		 * Alias of the component.
		 *
		 * @public
		 * @returns {String}
		 */
		get alias() {
			return this._alias;
		}

		/**
		 * Type of the component.
		 *
		 * @public
		 * @returns {ComponentType}
		 */
		get componentType() {
			return this._componentType;
		}

		/**
		 * Returns the component's items.
		 *
		 * @public
		 * @returns {Array<ComponentItem>}
		 */
		get componentItems() {
			return [...this._componentItems];
		}

		/**
		 * Throws an {@link Error} if the instance is invalid.
		 *
		 * @public
		 */
		validate() {
			return true;
		}

		toString() {
			return `[Component (name=${this._name})]`;
		}
	}

	return Component;
})();