const assert = require('common/lang/assert');

module.exports = (() => {
	'use strict';

	/**
	 * Converts a complex component into (and back from) the representation used
	 * on a DynamoDB record.
	 *
	 * @interface
	 */
	class ComponentSerializer {
		constructor() {

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

		serialize(component, source, target) {
			return;
		}

		deserialize(component, source, target) {
			return;
		}

		toString() {
			return '[ComponentSerializer]';
		}
	}

	return ComponentSerializer;
})();