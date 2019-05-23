const is = require('@barchart/common-js/lang/is'),
	object = require('@barchart/common-js/lang/object');

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
	 * @extends {Action}
	 * @param {Table} table
	 * @param {Index} index
	 * @param {Filter} filter
	 * @param {Array<Attribute>} attributes
	 * @param {Number=} limit
	 * @param {Boolean=} consistentRead
	 * @param {Boolean=} skipDeserialization
	 * @param {String=} description
	 */
	class Scan extends Action {
		constructor(table, index, filter, attributes, limit, consistentRead, skipDeserialization, description) {
			super(table, index, (description || '[Unnamed Scan]'));

			this._filter = filter || null;
			this._attributes = attributes || [ ];
			this._limit = limit || null;
			this._skipDeserialization = skipDeserialization || false;
			this._consistentRead = consistentRead || false;
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
		 * @public
		 * @returns {Attribute[]}
		 */
		get attributes() {
			return [...this._attributes];
		}

		/**
		 * The maximum number of results to returns from the scan. A null value
		 * will be interpreted as no limit.
		 *
		 * @public
		 * @returns {Number|null}
		 */
		get limit() {
			return this._limit;
		}

		/**
		 * If true, a consistent read will be used.
		 *
		 * @public
		 * @returns {Boolean}
		 */
		get consistentRead() {
			return this._consistentRead;
		}

		/**
		 * If true, the scan will return records in DynamoDB format, skipping
		 * the conversion to normal objects.
		 *
		 * @public
		 * @returns {Boolean}
		 */
		get skipDeserialization() {
			return this._skipDeserialization;
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

			if (this._index !== null && this._consistentRead && !this._index.type.allowsConsistentReads) {
				throw new Error('Unable to apply consistent read to index.');
			}

			if (this._filter !== null) {
				if (!(this._filter instanceof Filter)) {
					throw new Error('Filter data type is invalid.');
				}

				this._filter.validate();
			}

			if (this._limit !== null && (!is.large(this._limit) || !(this._limit > 0))) {
				throw new Error('The limit must be a positive integer.');
			}
		}

		/**
		 * Outputs an object suitable for running a "scan" operation using
		 * the DynamoDB SDK.
		 *
		 * @public
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

			let attributes = this.attributes;

			if (attributes.length !== 0) {
				schema.Select = 'SPECIFIC_ATTRIBUTES';
				schema.ProjectionExpression = Action.getProjectionExpression(this.table, attributes);
			}

			if (this._filter !== null) {
				const expressionData = Action.getConditionExpressionData(this.table, this._filter);

				schema.FilterExpression = expressionData.expression;

				if (object.keys(expressionData.valueAliases).length !== 0) {
					schema.ExpressionAttributeValues = expressionData.valueAliases;
				}

				attributes = attributes.concat(this._filter.expressions.map(e => e.attribute));
			}

			if (attributes.length !== 0) {
				schema.ExpressionAttributeNames = Action.getExpressionAttributeNames(this._table, attributes);
			}

			if (this._limit !== null) {
				schema.Limit = this._limit;
			}

			if (this._consistentRead) {
				schema.ConsistentRead = true;
			}

			return schema;
		}

		toString() {
			return '[Scan]';
		}
	}

	return Scan;
})();