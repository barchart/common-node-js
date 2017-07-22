const log4js = require('log4js'),
	Stream = require('stream');

const assert = require('common/lang/assert'),
	is = require('common/lang/is');

const DataType = require('./../schema/definitions/DataType'),
	Serializer = require('./../schema/serialization/Serializer'),
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
		 * @param {Boolean=} validate - If true, a check will be made to ensure all keys are present and valid.
		 * @param {Boolean=} silent - If true, errors will be suppressed.
		 */
		constructor(table, map, validate, silent) {
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

			this._silent = is.boolean(silent) && silent;

			let validator;

			if (is.boolean(validate) && validate) {
				validator = () => {

				}
			} else {

			}

			this._validator;
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

					const value = chunk[incoming];

					try {
						transformed[outgoing] = Serializer.coerce(value, type);
					} catch (e) {
						error = e;
					}

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