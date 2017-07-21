const log4js = require('log4js'),
	Stream = require('stream');

const assert = require('common/lang/assert'),
	is = require('common/lang/is');

const Attribute = require('./../schema/definitions/Attribute'),
	Table = require('./../schema/definitions/Table');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/aws/dynamo/stream/DynamoCoerceTransformer');

	/**
	 * <p>
	 *     A Node.js stream {@link Transform} which accepts objects (i.e. key/value
	 *     pairs) and converts the values to the proper data type, according to a
	 *     DynamoDB {@link Table} schema. For example, if an {@link Attribute}
	 *     is defined as a number, the value of the attribute will be coerced to
	 *     a number.
	 * </p>
	 * <p>
	 *     The consumer cannot control stream options and object-mode is hardcoded to
	 *     true.
	 * </p>
	 *
	 * @public
	 */
	class DynamoStreamTransformer extends Stream.Transform {
		/**
		 * @public
		 * @param {Table} table - The table schema used to coerce property values.
		 */
		constructor(table) {
			super({ objectMode: true });

			assert.argumentIsRequired(table, 'table', Table, 'Table');

			this._table = table;
		}

		_transform(chunk, encoding, callback) {
			if (is.object(chunk)) {

			} else {

			}
		}

		toString() {
			return '[DynamoStreamTransformer]';
		}
	}

	return DynamoStreamTransformer;
})();