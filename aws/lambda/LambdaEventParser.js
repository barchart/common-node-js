const assert = require('@barchart/common-js/lang/assert'),
	attributes = require('@barchart/common-js/lang/attributes'),
	Enum = require('@barchart/common-js/lang/Enum'),
	is = require('@barchart/common-js/lang/is'),
	promise = require('@barchart/common-js/lang/promise');
	Schema = require('@barchart/common-js/serialization/json/Schema');

const FailureReason = require('@barchart/common-js/api/failures/FailureReason'),
	FailureType = require('@barchart/common-js/api/failures/FailureType');

const LambdaTriggerType = require('./LambdaTriggerType');

module.exports = (() => {
	'use strict';

	/**
	 * A utility for working with the data passed to a Lambda Function.
	 *
	 * @public
	 * @param {Object} event - The actual "event" object passed to the Lambda Function by the AWS framework.
	 */
	class LambdaEventParser {
		constructor(event) {
			assert.argumentIsRequired(event, 'event', Object);

			this._event = event;
		}

		/**
		 * Reads the Lambda's event object directly.
		 *
		 * @public
		 * @param {String} key
		 * @returns {*}
		 */
		read(key) {
			assert.argumentIsRequired(key, 'key', String);

			return read(this._event, key);
		}

		/**
		 * Indicates if the consumer wants a plain text response, as evidenced
		 * by a "mode=text" query string value.
		 *
		 * @public
		 * @returns {Boolean}
		 */
		get plainText() {
			return this.getQuerystring('mode') === 'text';
		}

		/**
		 * Reads the context data (from custom authorizer).
		 *
		 * @public
		 * @param {String} key
		 * @returns {*|undefined}
		 */
		getContext(key) {
			assert.argumentIsRequired(key, 'key', String);

			return read(this._event, `requestContext.authorizer.${key}`);
		}

		/**
		 * Reads a request header.
		 *
		 * @public
		 * @param {String} key
		 * @returns {*|undefined}
		 */
		getHeader(key) {
			assert.argumentIsRequired(key, 'key', String);

			return read(this._event, `headers.${key}`);
		}

		/**
		 * Retrieves a value from path parameters.
		 *
		 * @public
		 * @param {String} key
		 * @returns {String|undefined}
		 */
		getPath(key) {
			assert.argumentIsRequired(key, 'key', String);

			return read(this._event, `pathParameters.${key}`);
		}

		/**
		 * Retrieves a value from querystring parameters.
		 *
		 * @public
		 * @param {String} key
		 * @returns {String|undefined}
		 */
		getQuerystring(key) {
			return read(Object.assign({}, this._event.queryStringParameters), key);
		}

		/**
		 * Retrieves the body (or a property from the body).
		 *
		 * @public
		 * @param {String=} key
		 * @returns {*}
		 */
		getBody(key) {
			let body = this._event.body;

			if (is.string(key)) {
				let source;

				if (is.string(body)) {
					try {
						source = JSON.parse(body);
					} catch (e) {
						source = null;
					}
				} else {
					source = body;
				}

				return read(source, key);
			} else {
				return body;
			}
		}

		/**
		 * Attempts to determine the correct schema based on the querystring.
		 *
		 * @public
		 * @param {Function} type
		 * @returns {Schema|null}
		 */
		getSchema(type) {
			assert.argumentIsValid(type, 'type', x => is.extension(Enum, type), 'is an enumeration');

			const code = this.getQuerystring('schema');

			let schema;

			if (code) {
				schema = Enum.fromCode(type, code);
			} else {
				schema = type.CLIENT;
			}

			return schema || null;
		}

		/**
		 * Attempts to deserialize JSON string into the given schema
		 *
		 * @public
		 * @param {String} jsonString
		 * @param {Object} schema
		 * @param {String} description
		 * @returns {Promise<Object>}
		 */
		parseSchema(jsonString, schema, description) {
			return Promise.resolve()
				.then(() => {
					assert.argumentIsRequired(jsonString, 'jsonString', String);
					assert.argumentIsRequired(schema, schema, Object);
					assert.argumentIsRequired(schema.schema, 'schema.schema', Schema, 'Schema');
					assert.argumentIsOptional(description, 'description', String);

					return promise.build((resolveCallback, rejectCallback) => {
						try {
							const reviver = schema.schema.getReviver();

							resolveCallback(JSON.parse(jsonString, reviver));
						} catch (e) {
							let reason;

							reason = FailureReason.forRequest({ endpoint: { description: (description || 'deserialize JSON string') } });
							reason = reason.addItem(FailureType.SCHEMA_VALIDATION_FAILURE, { key: e.key, name: e.name, schema: schema.schema.name });

							rejectCallback(reason);
						}
					});
				});
		}

		/**
		 * Returns an array of all messages included within the event.
		 *
		 * @public
		 * @param {Boolean=} text
		 * @return {Array<Object>}
		 */
		getMessages(text) {
			let messages;

			if (is.array(this._event.Records)) {
				messages = this._event.Records;
			} else {
				messages = [ this._event ];
			}

			return messages.map((message) => {
				const type = LambdaTriggerType.fromMessage(message);

				let content;

				if (type !== null) {
					content = type.getContent(message);
				} else {
					content = null;
				}

				if (content && (!is.boolean(text) || !text)) {
					content = JSON.parse(content);
				}

				return content;
			});
		}
	}

	function read(object, key) {
		if (is.object(object)) {
			return attributes.read(object, key);
		} else {
			return null;
		}
	}

	return LambdaEventParser;
})();