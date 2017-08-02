const assert = require('common/lang/assert');

const Filter = require('./Filter'),
	Serializer = require('./../../schema/serialization/Serializer');

module.exports = (() => {
	'use strict';

	/**
	 * The base class for a object which defines some sort of conditional
	 * operation that targets a {@link Table}.
	 *
	 * @public
	 * @interface
	 */
	class Lookup {
		/**
		 * @param {Table} table
		 * @param {Index=} index
		 * @param {String=} description
		 */
		constructor(table, index, description) {
			this._table = table;
			this._index = index || null;
			this._description = description;
		}

		/**
		 * A {@link Table} to target.
		 *
		 * @public
		 * @returns {Table}
		 */
		get table() {
			return this._table;
		}

		/**
		 * An {@Index} of the table to target (optional).
		 *
		 * @public
		 * @returns {Index|null}
		 */
		get index() {
			return this._index;
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
		 * Used to convert {@link Filter} definitions into data suitable for
		 * passing to the AWS SDK. This function is for internal use only.
		 *
		 * @protected
		 * @param {Filter} filter
		 * @param {Number} offset
		 * @returns {Object}
		 */
		static getExpressionData(filter, offset) {
			assert.argumentIsRequired(filter, 'filter', Filter, 'Filter');
			assert.argumentIsOptional(offset, 'offset', Number);

			const offsetToUse = offset || 0;

			return filter.expressions.reduce((accumulator, e, index) => {
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
			}, { components: [ ], aliases: { }, offset: offsetToUse + filter.expressions.length });
		}

		toString() {
			return '[Lookup]';
		}
	}

	return Lookup;
})();