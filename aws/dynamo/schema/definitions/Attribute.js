const assert = require('common/lang/assert'),
	is = require('common/lang/is');

const DataType = require('./DataType');

module.exports = (() => {
	'use strict';

	/**
	 * An explicitly defined field of a DynamoDB record.
	 *
	 * @public
	 */
	class Attribute {
		constructor(name, dataType) {
			this._name = name;
			this._dataType = dataType;
		}

		/**
		 * Name of the field.
		 *
		 * @public
		 * @returns {String}
		 */
		get name() {
			return this._name;
		}

		/**
		 * Type of the field.
		 *
		 * @public
		 * @returns {DataType}
		 */
		get dataType() {
			return this._dataType;
		}

		/**
		 * Throws an {@link Error} if the instance is invalid.
		 *
		 * @public
		 */
		validate() {
			if (!is.string(this._name) || this._name.length < 1) {
				throw new Error('Attribute name is invalid.');
			}

			if (!(this._dataType instanceof DataType)) {
				throw new Error('Attribute data type is invalid.');
			}
		}

		/**
		 * Generates an object which is suitable for use by the AWS SDK.
		 *
		 * @public
		 * @returns {Object}
		 */
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