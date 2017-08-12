const array = require('common/lang/array'),
	assert = require('common/lang/assert'),
	is = require('common/lang/is');

const Action = require('./Action'),
	Filter = require('./Filter'),
	Index = require('./../../schema/definitions/Index'),
	Table = require('./../../schema/definitions/Table');

module.exports = (() => {
	'use strict';

	/**
	 * The definition of a table (or index) scan.
	 *
	 * @public
	 * @param {Table} table
	 * @param {Index} index
	 * @param {Filter} filter
	 * @param {Array<Attribute>} attributes
	 * @param {String=} description
	 */
	class Scan extends Action {
		constructor(table, index, filter, attributes, description) {
			super(table, index, (description || '[Unnamed Scan]'));

			this._filter = filter || null;
			this._attributes = attributes || [ ];
		}

		/**
		 * A {@link Filter} to apply results scan.
		 *
		 * @public
		 * @returns {Filter}
		 */
		get filter() {
			return this._filter;
		}

		/**
		 * The {@link Attribute} instances to select. If the array is empty, all
		 * attributes will be selected.
		 *
		 * @returns {Array<Attribute>}
		 */
		get attributes() {
			return [...this._attributes];
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

			if (this._filter !== null) {
				if (!(this._filter instanceof Filter)) {
					throw new Error('Filter data type is invalid.');
				}

				this._filter.validate();
			}
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

			if (this._filter !== null) {
				const expressionData = Action.getExpressionData(this._filter);

				schema.FilterExpression = expressionData.components.join(' and ');
				schema.ExpressionAttributeValues = expressionData.aliases;
			}

			if (this._attributes.length !== 0) {
				const projectionData = Action.getProjectionData(this._attributes);

				schema.ExpressionAttributeNames = projectionData.aliases;
				schema.ProjectionExpression = projectionData.projection;
			}

			return schema;
		}

		toString() {
			return '[Scan]';
		}
	}

	return Scan;
})();