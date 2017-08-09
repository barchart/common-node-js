const assert = require('common/lang/assert');

const Conditional = require('./../definitions/Conditional'),
	Table = require('./../../schema/definitions/Table');

const ActionBuilder = require('./ActionBuilder'),
	FilterBuilder = require('./FilterBuilder');

module.exports = (() => {
	'use strict';

	/**
	 * Fluent interface for building a {@link Conditional}.
	 *
	 * @public
	 * @param {Table} table - The table targeted.
	 */
	class ConditionalBuilder extends ActionBuilder {
		constructor(table) {
			super();

			this._conditional = new Conditional(table);
		}

		/**
		 * The {@link Action}, given all the information provided thus far.
		 *
		 * @public
		 * @returns {Action}
		 */
		get action() {
			return this._conditional;
		}

		/**
		 * The {@link Conditional}, given all the information provided thus far.
		 *
		 * @public
		 * @returns {Conditional}
		 */
		get conditional() {
			return this._conditional;
		}

		/**
		 * Adds an item.
		 *
		 * @param {Object} item
		 * @returns {ConditionalBuilder}
		 */
		withItem(item) {
			this._conditional = new Conditional(this._conditional.table, this._conditional.filter, this._conditional.description, item);

			return this;
		}

		/**
		 * Adds a {@link Filter} to the scan, using a callback that
		 * provides the consumer with a {@link FilterBuilder} then
		 * returns the current instance.
		 *
		 * @public
		 * @param {Function} callback - Synchronously called, providing a {@link FilterBuilder} tied to the current instance.
		 * @returns {ConditionalBuilder}
		 */
		withFilterBuilder(callback) {
			assert.argumentIsRequired(callback, 'callback', Function);

			const filterBuilder = new FilterBuilder(this);

			callback(filterBuilder);

			this._conditional = new Conditional(this._conditional.table, filterBuilder.filter, this._conditional.description, this._conditional.item);

			return this;
		}

		/**
		 * Adds a description to the scan and returns the current instance.
		 *
		 * @public
		 * @param {String} description
		 * @returns {ConditionalBuilder}
		 */
		withDescription(description) {
			assert.argumentIsRequired(description, 'description', String);

			this._conditional = new Conditional(this._conditional.table, this._conditional.filter, description, this._conditional.item);

			return this;
		}

		/**
		 * Creates a new {@link ConditionalBuilder}.
		 *
		 * @param {String} name - Name of the table.
		 * @returns {ConditionalBuilder}
		 */
		static targeting(table) {
			assert.argumentIsRequired(table, 'table', Table, 'Table');

			return new ConditionalBuilder(table);
		}

		toString() {
			return '[ConditionalBuilder]';
		}
	}

	return ConditionalBuilder;
})();