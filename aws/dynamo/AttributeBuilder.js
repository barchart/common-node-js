const assert = require('common/lang/assert'),
	is = require('common/lang/is');

const Attribute = require('Attribute'),
	DataType = require('./DataType');

module.exports = (() => {
	'use strict';

	class AttributeBuilder {
		constructor(name) {
			assert.argumentIsRequired(name, 'name', String);

			this._attribute = new Attribute(name, null);
		}

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