const assert = require('@barchart/common-js/lang/assert'),
	is = require('@barchart/common-js/lang/is');

const DataType = require('./DataType');

module.exports = (() => {
	'use strict';

	/**
	 * An explicitly defined field of a DynamoDB record.
	 *
	 * @public
	 * @param {String} name
	 * @param {DataType} dataType
	 */
	class Attribute {
		constructor(name, dataType, derivation) {
			this._name = name;
			this._dataType = dataType || null;
			this._derivation = derivation || null;
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
		 * If this attribute derives its value from other attributes; then
		 * this property will return a {@link Derivation} instance; otherwise
		 * it return a null reference.
		 *
		 * @public
		 * @returns {Derivation|null}
		 */
		get derivation() {
			return this._derivation;
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

		/**
		 * Returns true of this attribute shares the same property values
		 * as the other attribute.
		 *
		 * @public
		 * @param {Attribute} other - The attribute to compare.
		 * @param {Boolean=} relaxed - If true, the dataType is not compared.
		 * @returns {Boolean}
		 */
		equals(other, relaxed) {
			let returnVal = other instanceof Attribute;

			if (returnVal) {
				returnVal = returnVal = this._name === other.name;

				if (!(is.boolean(relaxed) && relaxed)) {
					returnVal = returnVal && this._dataType === other.dataType;
				}
			}

			return returnVal;
		}

		toString() {
			return `[Attribute (name=${this._name})]`;
		}
	}

	return Attribute;
})();