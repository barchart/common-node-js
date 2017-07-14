const assert = require('common/lang/assert'),
	is = require('common/lang/is');

const DataType = require('./DataType');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/aws/dynamo/AttributeBuilder');

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

		withDataType(keyType) {
			assert.argumentIsRequired(keyType, 'keyType', DataType, 'DataType');

			this._dataType = dataType;

			return this;
		}

		validate() {
			if (!is.string(name) && name.length > 1) {
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