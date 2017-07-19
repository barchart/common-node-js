const assert = require('common/lang/assert'),
	is = require('common/lang/is');

const DataType = require('./DataType');

module.exports = (() => {
	'use strict';

	class Attribute {
		constructor(name, dataType) {
			this._name = name;
			this._dataType = dataType;
		}

		get name() {
			return this._name;
		}

		get dataType() {
			return this._dataType;
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

		toString() {
			return `[Attribute (name=${this._name})]`;
		}
	}

	return Attribute;
})();