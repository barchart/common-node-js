const array = require('common/lang/array'),
	assert = require('common/lang/assert'),
	is = require('common/lang/is');

const Filter = require('./Filter'),
	Index = require('./../../schema/definitions/Index'),
	Lookup = require('./Lookup'),
	Table = require('./../../schema/definitions/Table');

const Serializer = require('./../../schema/serialization/Serializer');

module.exports = (() => {
	'use strict';

	/**
	 * The definition of a table (or index) scan.
	 *
	 * @public
	 */
	class Scan extends Lookup {
		constructor(table, index, filter, description) {
			super();

			this._table = table;
			this._index = index || null;

			this._filter = filter;
			this._description = description || '[Unnamed Scan]';
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
		 * A description of the scan (for logging purposes).
		 *
		 * @public
		 * @returns {String}
		 */
		get description() {
			return this._description;
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

			if (this._index !== null && !this._table.indicies.some(i => i.equals(this._index, true))) {
				throw new Error('The index must belong to the table.');
			}

			if (!(this._filter instanceof Filter)) {
				throw new Error('Filter data type is invalid.');
			}

			this._filter.validate();
		}

		toScanSchema() {
			this.validate();

			const schema = {
				TableName: this._table.name
			};

			if (this._index !== null) {
				schema.IndexName = this._index.name;
			}

			const expressionData = this._filter.expressions.reduce((accumulator, e, index) => {
				const operatorType = e.operatorType;
				const operand = e.operand;

				const repeatCount = 1 + Math.floor(index / 26);
				const letterCode = 97 + (index % 26);

				const addAlias = (aliasName, aliasValue) => {
					accumulator.aliases[aliasName] = aliasValue;
				};

				let operandsToFormat;

				if (operatorType.operandIsArray) {
					operandsToFormat = operand.map((o, i) => {
						const aliasName = `:${String.fromCharCode(letterCode).repeat(repeatCount)}${i}`;
						const aliasValue = Serializer.serializeValue(operand[i], e.attribute.dataType);

						addAlias(aliasName, aliasValue);

						return aliasName;
					});
				} else {
					const aliasName = `:${String.fromCharCode(letterCode).repeat(repeatCount)}`;
					const aliasValue = Serializer.serializeValue(operand, e.attribute.dataType);

					addAlias(aliasName, aliasValue);

					operandsToFormat = aliasName;
				}

				accumulator.components.push(operatorType.format(e.attribute.name, operandsToFormat));

				return accumulator;
			}, { components: [ ], aliases: { } });

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