const assert = require('common/lang/assert');

const Scan = require('./../definitions/Scan');

const FilterBuilder = require('./FilterBuilder'),
	LookupBuilder = require('./LookupBuilder');

module.exports = (() => {
	'use strict';

	/**
	 * Fluent interface for building a {@link Scan}.
	 *
	 * @public
	 */
	class ScanBuilder extends LookupBuilder {
		/**
		 * @param {Table} table - The table targeted.
		 */
		constructor(table) {
			super();

			this._scan = new Scan(table);
			this._parent = parent;
		}

		/**
		 * The {@link Lookup}, given all the information provided thus far.
		 *
		 * @public
		 */
		get lookup() {
			return this._scan;
		}

		/**
		 * The {@link Scan}, given all the information provided thus far.
		 *
		 * @public
		 */
		get scan() {
			return this._scan;
		}

		/**
		 * Adds a {@link Filter} to the scan, using a callback that
		 * provides the consumer with a {@link FilterBuilder} then
		 * returns the current instance.
		 *
		 * @public
		 * @param {Function} callback - Synchronously called, providing a {@link FilterBuilder} tied to the current instance.
		 * @returns {ScanBuilder}
		 */
		withFilterBuilder(callback) {
			assert.argumentIsRequired(callback, 'callback', Function);

			const filterBuilder = new FilterBuilder(this);

			callback(filterBuilder);

			this._scan = new Scan(this._scan.table, this._scan.index, filterBuilder.filter);

			return this;
		}

		/**
		 * Changes the lookup target to an index of the table (instead of the
		 * table itself).
		 *
		 * @public
		 * @param {String} indexName - The {@link Index} to target.
		 * @returns {ScanBuilder}
		 */
		withIndex(indexName) {
			assert.argumentIsRequired(indexName, 'indexName', String);

			this._scan = new Scan(this._scan.table, getIndex(indexName, this._scan.table), this._scan.filter);

			return this;
		}

		toString() {
			return '[ScanBuilder]';
		}
	}

	function getIndex(name, table) {
		return table.indicies.find(i => i.name === name) || null;
	}

	return ScanBuilder;
})();