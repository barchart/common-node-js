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
		 * <p>
		 *     Wraps up a value as the DynamoDB representation.
		 * </p>
		 * <p>
		 *     For example, a numeric value of 19 is serialized as the
		 *     following object: { "N": "19" }.
	 	 * </p>
		 *
		 * @protected
		 * @param {*} value - The value to serialize.
		 * @returns {Object}
		 */
		serialize(value) {
			return value;
		}

		/**
		 * <p>
		 *     Unwraps the DynamoDB representation and returns a single value.
		 *     This operation is the inverse of {@link AttributeSerializer#serialize}.
		 * </p>
		 * <p>
		 *     For example, given the following DynamoDB representation object,
		 *     { "N": "19" }, the number 19 would be returned.
		 * </p>
		 *
		 * @protected
		 * @param {Object} wrapper - The DynamoDB wrapper to extract a value from.
		 * @returns {Object}
		 */
		deserialize(wrapper) {
			return wrapper;
		}

		/**
		 * Coerces a value into the type of value which would be accepted by the
		 * {@link AttributeSerializer#serialize} function and returned by the
		 * {@link AttributeSerializer#deserialize} function.
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