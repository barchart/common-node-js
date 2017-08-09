const array = require('common/lang/array'),
	assert = require('common/lang/assert'),
	is = require('common/lang/is'),
	object = require('common/lang/object');

const Action = require('./Action'),
	Filter = require('./Filter'),
	Index = require('./../../schema/definitions/Index'),
	KeyType = require('./../../schema/definitions/KeyType'),
	Table = require('./../../schema/definitions/Table');

module.exports = (() => {
	'use strict';

	/**
	 * The definition of a table (or index) query.
	 *
	 * @public
	 * @param {Table} table
	 * @param {Index} index
	 * @param {Filter} keyFilter
	 * @param {Filter} resultsFilter
	 * @param {String=} description
	 */
	class Query extends Action {
		constructor(table, index, keyFilter, resultsFilter, description) {
			super(table, index, (description || '[Unnamed Query]'));

			this._keyFilter = keyFilter || null;
			this._resultsFilter = resultsFilter || null;
		}

		/**
		 * A {@link Filter} to apply to key of the table (or index).
		 *
		 * @public
		 * @returns {Filter}
		 */
		get keyFilter() {
			return this._keyFilter;
		}

		/**
		 * A {@link Filter} to apply to results of the query (after the
		 * key filter has been applied).
		 *
		 * @public
		 * @returns {Filter}
		 */
		get resultsFilter() {
			return this._resultsFilter;
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

			if (!(this._keyFilter instanceof Filter)) {
				throw new Error('The key Filter data type is invalid.');
			}

			this._keyFilter.validate();

			let keys;

			if (this.index === null) {
				keys = this.table.keys;
			} else {
				keys = this.index.keys;
			}

			if (this._keyFilter.expressions.filter(e => e.attribute.name === (keys.find(k => k.keyType === KeyType.HASH)).attribute.name).length !== 1) {
				throw new Error('The key Filter must reference the index hash key.');
			}

			if (this._resultsFilter !== null) {
				if (!(this._resultsFilter instanceof Filter)) {
					throw new Error('The results Filter data type is invalid.');
				}

				this._resultsFilter.validate();
			}
		}

		/**
		 * Outputs an object suitable for running a "query" operation using
		 * the DynamoDB SDK.
		 *
		 * @public
		 * @returns {Object}
		 */
		toQuerySchema() {
			this.validate();

			const schema = {
				TableName: this.table.name
			};

			if (this.index !== null) {
				schema.IndexName = this.index.name;
			}

			const keyExpressionData = Action.getExpressionData(this._keyFilter);

			schema.KeyConditionExpression = keyExpressionData.components.join(' and ');

			let aliases;

			if (this._resultsFilter !== null) {
				const resultsExpressionData = Action.getExpressionData(this._resultsFilter, keyExpressionData.offset);

				schema.FilterExpression = resultsExpressionData.components.join(' and ');

				aliases = object.merge(keyExpressionData.aliases, resultsExpressionData.aliases);
			} else {
				aliases = keyExpressionData.aliases;
			}

			schema.ExpressionAttributeValues = aliases;

			return schema;
		}

		toString() {
			return '[Query]';
		}
	}

	return Query;
})();