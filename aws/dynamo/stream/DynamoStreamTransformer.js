const log4js = require('log4js'),
	Stream = require('stream');

const assert = require('common/lang/assert'),
	is = require('common/lang/is');

const DataType = require('./../schema/definitions/DataType'),
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
		 * @param {Object} map - A map of incoming attribute name's to {@link Attribute} names (from the {@link Table} argument).
		 */
		constructor(table, map) {
			super({ objectMode: true });

			assert.argumentIsRequired(table, 'table', Table, 'Table');
			assert.argumentIsRequired(table, 'table', Table, 'Table');

			const attributes = table.attributes;

			this._transforms = Object.keys(map).map((incoming) => {
				const outgoing = map[incoming];

				return {
					incoming: incoming,
					attribute: attributes.find(a => a.name === outgoing)
				};
			});
		}

		_transform(chunk, encoding, callback) {
			if (is.object(chunk)) {
				let valid = true;

				let transformed = { };
				let error = null;

				this._transforms.every((transform) => {
					const incoming = transform.incoming;
					const outgoing = transform.attribute.name;
					const type = transform.attribute.dataType;

					if (!chunk.hasOwnProperty(incoming)) {
						throw new Error(`Unable to transform to object to DynamoDB schema, expected property missing [ ${incoming} ]`);
					}

					let value = chunk[incoming];

					if (type === DataType.STRING) {
						if (!is.string(value)) {
							value = value.toString();
						}
					} else if (type === DataType.NUMBER) {
						if (!is.number(value)) {
							value = parseFloat(value);
						}
					} else {
						throw new Error(`Unable to transform to object to DynamoDB schema, unexpected property type ${type.toString()}`);
					}

					transformed[outgoing] = value;

					return error === null;
				}, { });

				if (error === null) {
					callback(null, transformed);
				} else {
					callback(error);
				}
			} else {
				callback(new Error('Unable to transform to object to DynamoDB schema, unexpected input type.'));
			}
		}

		toString() {
			return '[DynamoStreamTransformer]';
		}
	}

	return DynamoStreamTransformer;
})();