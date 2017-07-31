const array = require('common/lang/array'),
	assert = require('common/lang/assert'),
	is = require('common/lang/is');

const Filter = require('./Filter'),
	Lookup = require('./Lookup'),
	Table = require('./../../schema/definitions/Table');

module.exports = (() => {
	'use strict';

	/**
	 * An set of instructions for conditional updates, inserts, or
	 * deletes.
	 *
	 * @public
	 */
	class Condition extends Lookup {
		/**
		 * @param {Table} table
		 * @param {Filter} filter
		 * @param {String=} description
		 */
		constructor(table, filter, description) {
			super(table, null, (description || '[Unnamed Condition]'));

			this._filter = filter;
		}

		/**
		 * A {@link Filter} to apply to the table (or index) during the scan.
		 *
		 * @public
		 * @returns {Filter}
		 */
		get filter() {
			return this._filter;
		}

		/**
		 * Throws an {@link Error} if the instance is invalid.
		 *
		 * @public
		 */
		validate() {
			if (!(this.table instanceof Table)) {
				throw new Error('Table data type is invalid.');
			}

			if (!(this._filter instanceof Filter)) {
				throw new Error('Filter data type is invalid.');
			}

			this._filter.validate();
		}

		toString() {
			return '[Condition]';
		}
	}

	return Condition;
})();