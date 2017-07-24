const array = require('common/lang/array'),
	assert = require('common/lang/assert'),
	is = require('common/lang/is');

const Filter = require('./Filter'),
	Index = require('./../../schema/definitions/Index'),
	Lookup = require('./Lookup'),
	Table = require('./../../schema/definitions/Table');

module.exports = (() => {
	'use strict';

	/**
	 * The collection of {@link Expression} objects that compose a filter.
	 *
	 * @public
	 */
	class Scan extends Lookup {
		constructor(table, index, filter) {
			super();

			this._table = table;
			this._index = index || null;

			this._filter = filter;
		}

		/**
		 * A {@link Table} to scan.
		 *
		 * @public
		 * @returns {Table}
		 */
		get table() {
			return this._table;
		}

		/**
		 * An {@Index} of the table to scan (optional).
		 *
		 * @public
		 * @returns {Index}
		 */
		get index() {
			return this._index;
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
			if (!(this._table instanceof Table)) {
				throw new Error('Table data type is invalid.');
			}

			if (this._index !== null && !(this._index instanceof Index)) {
				throw new Error('Index data type is invalid.');
			}

			if (!this._table.indicies.some(i => i.equals(this._index, true))) {
				throw new Error('The index must belong to the table.');
			}

			if (!(this._filter instanceof Filter)) {
				throw new Error('Filter data type is invalid.');
			}

			this._filter.validate();
		}

		toString() {
			return '[Scan]';
		}
	}

	return Scan;
})();