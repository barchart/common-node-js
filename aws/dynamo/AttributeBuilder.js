const assert = require('common/lang/assert'),
	is = require('common/lang/is');

const DataType = require('./DataType');

module.exports = (() => {
	'use strict';

	class AttributeBuilder {
		constructor(name) {
			assert.argumentIsRequired(name, 'name', String);

			this._name = name;
			this._dataType = null;
		}

		get name() {
			return this._name;
		}

		get dataType() {
			return this._dataType;
		}

		withDataType(dataType) {
			assert.argumentIsRequired(dataType, 'dataType', DataType, 'DataType');

			this._dataType = dataType;

			return this;
		}

		validate() {
			if (!is.string(this._name) || this._name.length < 1) {
				throw new Error('Attribute name is invalid.');
			}

			if (!(this._dataType instanceof DataType)) {
				throw new Error('Attribute data type is invalid.');
			}
		}

		toAttributeSchema() {
			this.validate();

			return {
				AttributeName: this._name,
				AttributeType: this._dataType.code
			};
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