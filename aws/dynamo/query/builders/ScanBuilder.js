const assert = require('common/lang/assert');

const Scan = require('./../definitions/Scan'),
	Table = require('./../../schema/definitions/Table');

const ActionBuilder = require('./ActionBuilder'),
	FilterBuilder = require('./FilterBuilder');

module.exports = (() => {
	'use strict';

	/**
	 * Fluent interface for building a {@link Scan}.
	 *
	 * @public
	 * @param {Table} table - The table targeted.
	 */
	class ScanBuilder extends ActionBuilder {
		constructor(table) {
			super();

			this._scan = new Scan(table);
		}

		/**
		 * The {@link Action}, given all the information provided thus far.
		 *
		 * @public
		 * @returns {Action}
		 */
		get action() {
			return this._scan;
		}

		/**
		 * The {@link Scan}, given all the information provided thus far.
		 *
		 * @public
		 * @returns {Scan}
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

			this._scan = new Scan(this._scan.table, this._scan.index, filterBuilder.filter, this._scan.attributes, this._scan.description);

			return this;
		}

		/**
		 * Changes the action target to an index of the table (instead of the
		 * table itself) and returns the current instance.
		 *
		 * @public
		 * @param {String} indexName - The {@link Index} to target.
		 * @returns {ScanBuilder}
		 */
		withIndex(indexName) {
			assert.argumentIsRequired(indexName, 'indexName', String);

			this._scan = new Scan(this._scan.table, getIndex(indexName, this._scan.table), this._scan.filter, this._scan.attributes, this._scan.description);

			return this;
		}

		/**
		 * The name of an attribute to select.
		 *
		 * @public
		 * @param {String} attributeName
		 */
		withAttribute(attributeName) {
			assert.argumentIsRequired(attributeName, 'attributeName', String);

			const attribute = getAttribute(attributeName, this._scan.table);

			if (attribute !== null) {
				const attributes = this.scan.attributes;

				if (!attributes.some(a => a.name === attribute.name)) {
					attributes.push(attribute);

					this._scan = new Scan(this._scan.table, this._scan.index, this._scan.filter, attributes, this._scan.description);
				}
			}

			return this;
		}

		/**
		 * Adds a description to the scan and returns the current instance.
		 *
		 * @public
		 * @param {String} description
		 * @returns {ScanBuilder}
		 */
		withDescription(description) {
			assert.argumentIsRequired(description, 'description', String);

			this._scan = new Scan(this._scan.table, this._scan.index, this._scan.filter, this._scan.attributes, description);

			return this;
		}

		/**
		 * Creates a new {@link ScanBuilder}.
		 *
		 * @param {String} name - Name of the table.
		 * @returns {ScanBuilder}
		 */
		static targeting(table) {
			assert.argumentIsRequired(table, 'table', Table, 'Table');

			return new ScanBuilder(table);
		}

		toString() {
			return '[ScanBuilder]';
		}
	}

	function getIndex(name, table) {
		return table.indicies.find(i => i.name === name) || null;
	}

	function getAttribute(name, table) {
		return table.attributes.find(a => a.name === name) || null;
	}

	return ScanBuilder;
})();