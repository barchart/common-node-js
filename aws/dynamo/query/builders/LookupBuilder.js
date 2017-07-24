module.exports = (() => {
	'use strict';

	/**
	 * Base class for a fluent interface for building a {@link Lookup}.
	 *
	 * @public
	 * @interface
	 */
	class LookupBuilder {
		constructor() {
		}

		/**
		 * The target of the lookup.
		 *
		 * @returns {Lookup}
		 */
		get lookup() {
			return null;
		}

		toString() {
			return '[LookupBuilder]';
		}
	}

	return LookupBuilder;
})();