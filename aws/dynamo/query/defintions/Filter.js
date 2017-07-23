const array = require('common/lang/array'),
	assert = require('common/lang/assert'),
	is = require('common/lang/is');

const Expression = require('./Expression');

module.exports = (() => {
	'use strict';

	/**
	 * The collection of {@link Expression} objects that compose a filter.
	 *
	 * @public
	 */
	class Filter {
		constructor(expressions) {
			this._expressions = expressions;
		}

		/**
		 * The collection of {@link Expression} objects that compose a filter.
		 *
		 * @public
		 * @returns {Array<Expression>}
		 */
		get expressions() {
			return [...this._expressions];
		}

		/**
		 * Throws an {@link Error} if the instance is invalid.
		 *
		 * @public
		 */
		validate() {
			if (this._expressions.length === 0) {
				throw new Error('Filter must contain at least one Expression.');
			}

			if (!this._expressions.every((e => e instanceof Expression))) {
				throw new Error('Filter expression array can only contain Expression instances.');
			}

			if (!array.uniqueBy(this._expressions, e => e.attribute.name)) {
				throw new Error('Filter expression array can only contain Expression instances.');
			}
		}

		toString() {
			return '[Filter]';
		}
	}

	return Filter;
})();