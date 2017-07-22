const assert = require('common/lang/assert');

module.exports = (() => {
	'use strict';

	/**
	 * Converts a value into (and back from) the representation used
	 * on a DynamoDB record.
	 *
	 * @interface
	 */
	class AttributeSerializer {
		constructor() {

		}

		/**
		 * Wraps up a value as the DynamoDB representation. For example,
		 * an implementation for numbers should serialize 19 as the
		 * following object: { "N": "19" }.
		 *
		 * @protected
		 * @param {*} value - The value to serialize.
		 * @returns {Object}
		 */
		serialize(value) {
			return value;
		}

		/**
		 * Unwraps the DynamoDB representation and returns a single value. For
		 * example, an implementation for numbers should deserialize the object
		 * { "N": "19" } to the number 19. This operation is the inverse of
		 * {@link AttributeSerializer#serialize}.
		 *
		 * @protected
		 * @param {Object} wrapper - The DynamoDB wrapper to extract a value from.
		 * @returns {Object}
		 */
		deserialize(wrapper) {
			return wrapper;
		}

		/**
		 * Returns true if the value can be coerced without an error
		 * occurring.
		 *
		 * @param {*} value - The value to check.
		 * @returns {boolean}
		 */
		canCoerce(value) {
			let returnVal;

			try {
				this.canCoerce(value);

				returnVal = true;
			} catch (e) {
				returnVal = false;
			}

			return returnVal;
		}

		/**
		 * Coerces a value into the type of value which would be accepted by the
		 * {@link AttributeSerializer#serialize} function and returned by the
		 * {@link AttributeSerializer#deserialize} function. This function may
		 * throw an error.
		 *
		 * @protected
		 * @param {Object} value - The value to coerce.
		 * @returns {Object} - The coerced value.
		 */
		coerce(value) {
			return value;
		}

		toString() {
			return '[AttributeSerializer]';
		}
	}

	return AttributeSerializer;
})();