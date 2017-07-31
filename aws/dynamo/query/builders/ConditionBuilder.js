const assert = require('common/lang/assert');

const Condition = require('./../definitions/Condition'),
	Table = require('./../../schema/definitions/Table');

const FilterBuilder = require('./FilterBuilder'),
	LookupBuilder = require('./LookupBuilder');

module.exports = (() => {
	'use strict';

	/**
	 * Fluent interface for building a {@link Condition}.
	 *
	 * @public
	 */
	class ConditionBuilder extends LookupBuilder {
		/**
		 * @param {Table} table - The table targeted.
		 */
		constructor(table) {
			super();

			this._condition = new Condition(table);
		}

		/**
		 * The {@link Lookup}, given all the information provided thus far.
		 *
		 * @public
		 */
		get lookup() {
			return this._condition;
		}

		/**
		 * The {@link Condition}, given all the information provided thus far.
		 *
		 * @public
		 */
		get condition() {
			return this._condition;
		}

		/**
		 * Adds a {@link Filter} to the scan, using a callback that
		 * provides the consumer with a {@link FilterBuilder} then
		 * returns the current instance.
		 *
		 * @public
		 * @param {Function} callback - Synchronously called, providing a {@link FilterBuilder} tied to the current instance.
		 * @returns {ConditionBuilder}
		 */
		withFilterBuilder(callback) {
			assert.argumentIsRequired(callback, 'callback', Function);

			const filterBuilder = new FilterBuilder(this);

			callback(filterBuilder);

			this._condition = new Condition(this._condition.table, filterBuilder.filter, this._condition.description);

			return this;
		}

		/**
		 * Adds a description to the scan and returns the current instance.
		 *
		 * @public
		 * @param {String} description
		 * @returns {ConditionBuilder}
		 */
		withDescription(description) {
			assert.argumentIsRequired(description, 'description', String);

			this._condition = new Condition(this._condition.table, this._condition.filter, description);

			return this;
		}

		/**
		 * Creates a new {@link ConditionBuilder}.
		 *
		 * @param {String} name - Name of the table.
		 * @returns {ConditionBuilder}
		 */
		static targeting(table) {
			assert.argumentIsRequired(table, 'table', Table, 'Table');

			return new ConditionBuilder(table);
		}

		toString() {
			return '[ConditionBuilder]';
		}
	}

	return ConditionBuilder;
})();