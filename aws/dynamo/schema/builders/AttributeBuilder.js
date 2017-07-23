const assert = require('common/lang/assert');

const Attribute = require('./../definitions/Attribute'),
	DataType = require('./../definitions/DataType');

module.exports = (() => {
	'use strict';

	/**
	 * Fluent interface for building an {@link Attribute}.
	 *
	 * @public
	 */
	class AttributeBuilder {
		constructor(name) {
			assert.argumentIsRequired(name, 'name', String);

			this._attribute = new Attribute(name, null);
		}

		/**
		 * The {@link Attribute}, given all the information provided thus far.
		 *
		 * @public
		 */
		get attribute() {
			return this._attribute;
		}

		withDataType(dataType) {
			assert.argumentIsRequired(dataType, 'dataType', DataType, 'DataType');

			this._attribute = new Attribute(this._attribute.name, dataType);

			return this;
		}

		static withName(name) {
			return new AttributeBuilder(name);
		}

		toString() {
			return '[AttributeBuilder]';
		}
	}

	return AttributeBuilder;
})();