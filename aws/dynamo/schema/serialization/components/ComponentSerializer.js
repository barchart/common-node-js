const assert = require('common/lang/assert');

const AttributeSerializer = require('./../attributes/AttributeSerializer');

module.exports = (() => {
	'use strict';

	/**
	 * Converts a complex component into (and back from) the representation used
	 * on a DynamoDB record.
	 *
	 * @interface
	 */
	class ComponentSerializer {
		constructor(attributeSerializers) {
			assert.argumentIsArray(attributeSerializers, 'attributeSerializers', AttributeSerializer, 'AttributeSerializer');

			this._attributeSerializers = attributeSerializers;
		}

		/**
		 * The {@link ComponentType} the serializer is related to.
		 *
		 * @public
		 * @abstract
		 * @returns {ComponentType}
		 */
		get componentType() {
			return null;
		}

		/**
		 * Accepts the component object (i.e. the source) and writes out
		 * the components attributes (using DynamoDB syntax) to the target.
		 *
		 * @public
		 * @param {Component} component
		 * @param {Object} source
		 * @param {Object} target
		 */
		serialize(component, source, target) {
			const componentName = component.name;

			if (source.hasOwnProperty(componentName)) {
				const items = this._readComponent(source[componentName]);
				const definitions = this.componentType.definitions;

				if (items !== null && items.length === definitions.length) {
					definitions.forEach((ctd, i) => {
						const name = ctd.getFieldName(component);
						const serializer = this._attributeSerializers.get(ctd.dataType);

						target[name] = serializer.serialize(items[i]);
					});
				}
			}
		}

		/**
		 * Reads each property value from the component object and returns
		 * an array of values in the same order as specified by the
		 * {@link ComponentType#definitions} array.
		 *
		 * @protected
		 * @abstract
		 * @param {*} object
		 * @returns {Array}
		 */
		_readComponent(object) {
			return null;
		}

		/**
		 * Reads a component from a DynamoDB data object (i.e. the source)
		 * and assigns it to the target.
		 *
		 * @param {Component} component
		 * @param {Object} source
		 * @param {Object} target
		 */
		deserialize(component, source, target) {
			const data = this.componentType.definitions.reduce((items, ctd) => {
				if (items) {
					const name = ctd.getFieldName(component);
					const serializer = this._attributeSerializers.get(ctd.dataType);

					if (source.hasOwnProperty(name)) {
						items.push(serializer.deserialize(source[name]));
					} else {
						items = null;
					}
				}

				return items;
			}, [ ]);

			if (data !== null) {
				target[component.name] = this._createComponent(data);
			}
		}

		/**
		 * Given an array of data points, in the same order as the
		 * {@link ComponentType#definitions} array, return a single
		 * component object.
		 *
		 * @protected
		 * @abstract
		 * @param {Array} data
		 * @returns {*}
		 */
		_createComponent(data) {
			return null;
		}

		toString() {
			return '[ComponentSerializer]';
		}
	}

	return ComponentSerializer;
})();