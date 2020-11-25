const is = require('@barchart/common-js/lang/is'),
	assert = require('@barchart/common-js/lang/assert');

const LambdaResponseProcessor = require('./responses/LambdaResponseProcessor'),
	LambdaResponseStrategy = require('./responses/LambdaResponseStrategy');

module.exports = (() => {
	'use strict';

	/**
	 * Manages compilation and transmission of the response to from a
	 * Lambda Function bound to the API Gateway.
	 *
	 * @public
	 * @param {Function} callback - The actual "callback" function passed to the Lambda Function by the AWS framework.
	 */
	class LambdaResponder {
		constructor(callback) {
			assert.argumentIsRequired(callback, 'callback', Function);

			this._callback = callback;
			this._processor = new LambdaResponseProcessor();

			this._headers = { };
			
			this.setHeader('Access-Control-Allow-Origin', '*')
				.setHeader('Access-Control-Allow-Credentials', true)
				.setHeader('Content-Type', 'application/json');

			this._complete = false;
		}

		/**
		 * If true, the response has already been transmitted.
		 *
		 * @public
		 * @returns {Boolean}
		 */
		get complete() {
			return this._complete;
		}

		/**
		 * Response headers.
		 *
		 * @public
		 * @returns {Object}
		 */
		get headers() {
			return this._headers;
		}

		/**
		 * Sets an HTTP header.
		 *
		 * @public
		 * @param {String} key
		 * @param {String|Number|Boolean} value
		 * @returns {LambdaResponder}
		 */
		setHeader(key, value) {
			assert.argumentIsRequired(key, 'key', String);

			if (!this.complete) {
				this._headers[key] = value;
			}

			return this;
		}

		/**
		 * Sets a response header for plain text.
		 *
		 * @public
		 * @returns {LambdaResponder}
		 */
		setPlainText() {
			return this.setHeader('Content-Type', 'text/plain');
		}
		
		/**
		 * Adds a {@link LambdaResponseStrategy} instance.
		 *
		 * @public
		 * @param {LambdaResponseStrategy} strategy
		 * @returns {LambdaResponder}
		 */
		addResponseStrategy(strategy) {
			assert.argumentIsRequired(strategy, 'strategy', LambdaResponseStrategy, 'LambdaResponseStrategy');

			this._processor.addResponseStrategy(strategy);

			return this;
		}

		/**
		 * Adds multiple {@link LambdaResponseStrategy} instances.
		 *
		 * @public
		 * @param {Array<LambdaResponseStrategy>} strategies
		 * @returns {LambdaResponder}
		 */
		addResponseStrategies(strategies) {
			strategies.forEach(s => this.addResponseStrategy(s));

			return this;
		}

		/**
		 * Immediately transmits an error response.
		 *
		 * @public
		 * @param {Object|String} response
		 * @param {Number=} code
		 */
		sendError(response, code) {
			if (!this.complete) {
				this.send(response, code || 500);
			}
		}

		/**
		 * Immediately transmits a successful response.
		 *
		 * @public
		 * @param {Object|String} response
		 * @param {Number=} code
		 */
		send(response, code) {
			if (this.complete) {
				return;
			}

			let serialized;

			if (is.object(response)) {
				serialized = JSON.stringify(response);
			} else if (is.string(response)) {
				serialized = response;
			} else {
				throw new Error('Unable to use response. The response must be a string or an object.');
			}

			return this._processor.process(this, serialized, code);
		}

		/**
		 * Immediately transmits a base-64 encoded response.
		 *
		 * @public
		 * @param {Buffer} buffer
		 * @param {String=} contextType
		 */
		sendBinary(buffer, contentType) {
			assert.argumentIsOptional(contentType, 'contentType', String);

			if (contentType) {
				this.setHeader('Content-Type', contentType);
			}

			const payload = { };

			payload.headers = this._headers;
			payload.statusCode = 200;
			payload.body = buffer.toString('base64');
			payload.isBase64Encoded = true;

			this.sendRaw(payload);
		}

		/**
		 * Immediately transmits an ad hoc response.
		 *
		 * @public
		 * @param {*} response
		 * @param {*} error
		 */
		sendRaw(response, error) {
			if (this.complete) {
				return;
			}

			this._complete = true;

			this._callback(error || null, response);
		}
		
		toString() {
			return '[LambdaResponder]';
		}
	}

	return LambdaResponder;
})();
