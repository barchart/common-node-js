const assert = require('common/lang/assert');

const Query = require('./../definitions/Query'),
	Table = require('./../../schema/definitions/Table');

const FilterBuilder = require('./FilterBuilder'),
	LookupBuilder = require('./LookupBuilder');

module.exports = (() => {
	'use strict';

	/**
	 * Fluent interface for building a {@link Query}.
	 *
	 * @public
	 */
	class QueryBuilder extends LookupBuilder {
		/**
		 * @param {Table} table - The table targeted.
		 */
		constructor(table) {
			super();

			this._query = new Query(table);
		}

		/**
		 * The {@link Lookup}, given all the information provided thus far.
		 *
		 * @public
		 */
		get lookup() {
			return this._query;
		}

		/**
		 * The {@link Query}, given all the information provided thus far.
		 *
		 * @public
		 */
		get query() {
			return this._query;
		}

		/**
		 * Changes the lookup target to an index of the table (instead of the
		 * table itself) and returns the current instance.
		 *
		 * @public
		 * @param {String} indexName - The {@link Index} to target.
		 * @returns {QueryBuilder}
		 */
		withIndex(indexName) {
			assert.argumentIsRequired(indexName, 'indexName', String);

			this._query = new Query(this._query.table, getIndex(indexName, this._query.table), this._query.keyFilter, this._query.resultsFilter, this._query.description);

			return this;
		}

		/**
		 * Adds a {@link Filter} targeting the table's (or indexes) key. Uses a callback
		 * to provides the consumer with a {@link FilterBuilder}.
		 *
		 * @public
		 * @param {Function} callback - Synchronously called, providing a {@link FilterBuilder} tied to the current instance.
		 * @returns {QueryBuilder}
		 */
		withKeyFilterBuilder(callback) {
			assert.argumentIsRequired(callback, 'callback', Function);

			const filterBuilder = new FilterBuilder(this);

			callback(filterBuilder);

			this._query = new Query(this._query.table, this._query.index, filterBuilder.filter, this._query.resultsFilter, this._query.description);

			return this;
		}

		/**
		 * Adds a {@link Filter} to the query which results after the key filter has
		 * been evaluated.  Uses a callback to provides the consumer with a {@link FilterBuilder}.
		 *
		 * @public
		 * @param {Function} callback - Synchronously called, providing a {@link FilterBuilder} tied to the current instance.
		 * @returns {QueryBuilder}
		 */
		withResultsFilterBuilder(callback) {
			assert.argumentIsRequired(callback, 'callback', Function);

			const filterBuilder = new FilterBuilder(this);

			callback(filterBuilder);

			this._query = new Query(this._query.table, this._query.index, this._query.keyFilter, filterBuilder.filter, this._query.description);

			return this;
		}

		/**
		 * Adds a description to the scan and returns the current instance.
		 *
		 * @public
		 * @param {String} description
		 * @returns {QueryBuilder}
		 */
		withDescription(description) {
			assert.argumentIsRequired(description, 'description', String);

			this._query = new Query(this._query.table, this._query.index, this._query.keyFilter, this._query.resultsFilter, description);

			return this;
		}

		/**
		 * Creates a new {@link QueryBuilder}.
		 *
		 * @public
		 * @param {Table} table
		 * @param {String} indexName - Name of the index.
		 * @returns {QueryBuilder}
		 */
		static targeting(table) {
			assert.argumentIsRequired(table, 'table', Table, 'Table');

			return new QueryBuilder(table);
		}

		toString() {
			return '[QueryBuilder]';
		}
	}

	function getIndex(name, table) {
		return table.indicies.find(i => i.name === name) || null;
	}

	return QueryBuilder;
})();