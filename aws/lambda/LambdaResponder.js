const is = require('@barchart/common-js/lang/is'),
	assert = require('@barchart/common-js/lang/assert');

const LambdaCompressionController = require('./compression/LambdaCompressionController');

const LambdaCompressionStrategy = require('./compression/LambdaCompressionStrategy');

module.exports = (() => {
	'use strict';

	/**
	 * Manages compilation and transmission of the response to from a
	 * Lambda function bound to the API Gateway.
	 *
	 * @public
	 * @param {Function} callback - The Lambda's callback.
	 */
	class LambdaResponder {
		constructor(callback) {
			assert.argumentIsRequired(callback, 'callback', Function);

			this._headers = { };

			this.setHeader('Access-Control-Allow-Origin', '*')
				.setHeader('Access-Control-Allow-Credentials', true)
				.setHeader('Content-Type', 'application/json');

			this._callback = callback;

			this._complete = false;
			this._compressionController = new LambdaCompressionController();
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
		 * @return {Object}
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
		 * Adds a {@link LambdaCompressionStrategy} to the compression controller.
		 *
		 * @public
		 * @param {LambdaCompressionStrategy|Array<LambdaCompressionStrategy>} strategy
		 * @return {LambdaResponder}
		 */
		addCompressionStrategy(strategy) {
			if (is.array(strategy)) {
				assert.argumentIsArray(strategy, 'strategy', LambdaCompressionStrategy, 'LambdaCompressionStrategy');

				strategy.forEach(s => this._compressionController.add(s));
			} else {
				assert.argumentIsRequired(strategy, 'strategy', LambdaCompressionStrategy, 'LambdaCompressionStrategy');

				this._compressionController.add(strategy);
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
		 * Sets an error and transmit the response.
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
		 * Sends a raw response payload
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

		/**
		 * Sets and transmits the response.
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
			} else {
				serialized = response;
			}

			return this._compressionController.respond(this, serialized, code);
		}

		/**
		 * Sets and transmits the response as base-64 encoded data.
		 *
		 * @public
		 * @param {Buffer} buffer
		 * @param {String=} contextType
		 */
		sendBinary(buffer, contentType) {
			const payload = { };

			if (is.string(contentType)) {
				this.setHeader('Content-Type', contentType);
			}

			payload.statusCode = 200;
			payload.body = buffer.toString('base64');
			payload.isBase64Encoded = true;
			payload.headers = this._headers;

			this.sendRaw(payload);
		}
	}

	return LambdaResponder;
})();
