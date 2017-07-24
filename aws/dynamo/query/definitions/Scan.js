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
	 * The definition of a table (or index) scan.
	 *
	 * @public
	 */
	class Scan extends Lookup {
		/**
		 * @param {Table} table
		 * @param {Index} index
		 * @param {Filter} filter
		 * @param {String=} description
		 */
		constructor(table, index, filter, description) {
			super(table, index, (description || '[Unnamed Scan]'));

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

			if (this.index !== null && !(this.index instanceof Index)) {
				throw new Error('Index data type is invalid.');
			}

			if (this.index !== null && !this.table.indicies.some(i => i.equals(this.index, true))) {
				throw new Error('The index must belong to the table.');
			}

			if (!(this._filter instanceof Filter)) {
				throw new Error('Filter data type is invalid.');
			}

			this._filter.validate();
		}

		/**
		 * Outputs an object suitable for running a "scan" operation using
		 * the DynamoDB SDK.
		 *
		 * @returns {Object}
		 */
		toScanSchema() {
			this.validate();

			const schema = {
				TableName: this.table.name
			};

			if (this.index !== null) {
				schema.IndexName = this.index.name;
			}

			const expressionData = Lookup.getExpressionData(this._filter);

			schema.FilterExpression = expressionData.components.join(' and ');
			schema.ExpressionAttributeValues = expressionData.aliases;

			return schema;
		}

		toString() {
			return '[Scan]';
		}
	}

	return Scan;
})();