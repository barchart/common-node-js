const log4js = require('log4js');

const assert = require('@barchart/common-js/lang/assert'),
	is = require('@barchart/common-js/lang/is');

const Verb = require('./../../network/http/Verb');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('lambda/MessageProcessor');

	/**
	 * A function wrapper for processing Lambdas coupled with a
	 * predicate to determine if the instance *can* process the
	 * input.
	 *
	 * @public
	 * @interface
	 */
	class MessageProcessor {
		constructor() {

		}

		/**
		 * Returns true if the arguments could be handled by the {MessageProcessor#process},
		 * function; otherwise, false.
		 *
		 * @public
		 * @param {*} message - The message to process.
		 * @param {LambdaEnvironment} environment - The environment.
		 * @param {Object} components - An object containing the "components" required for processing.
		 * @param {Object} logger - A log4js logger instance.
		 * @returns {boolean}
		 */
		canProcess(message, environment, components, logger) {
			return this._canProcess(message, environment, components, logger);
		}

		/**
		 * @protected
		 * @ignore
		 * @param {*} message
		 * @param {LambdaEnvironment} environment
		 * @param {Object} components
		 * @param {Object} logger
		 * @returns {boolean}
		 */
		_canProcess(message, environment, components, logger) {
			return true;
		}

		/**
		 * Processes the message.
		 *
		 * @public
		 * @param {*} message - The message to process.
		 * @param {LambdaEnvironment} environment - The environment.
		 * @param {Object} components - An object containing the "components" required for processing.
		 * @param {Object} logger - A log4js logger instance.
		 * @returns {*}
		 */
		process(message, environment, components, logger) {
			if (!this._canProcess(message, environment, components, logger)) {
				throw new Error('Lambda processor cannot execute, argument(s) are invalid.');
			}

			return this._process(message, environment, components, logger);
		}

		/**
		 * @protected
		 * @ignore
		 * @param {*} message
		 * @param {LambdaEnvironment} environment
		 * @param {Object} components
		 * @param {Object} logger
		 * @returns {*}
		 */
		_process(message, environment, components, logger) {
			return null;
		}

		/**
		 * Returns a {@link MessageProcessor} that is backed by functions.
		 *
		 * @public
		 * @param {Function} processDelegate
		 * @param {Function=} canProcessPredicate
		 * @returns {MessageProcessor}
		 */
		static fromFunction(processDelegate, canProcessPredicate) {
			assert.argumentIsRequired(processDelegate, 'processDelegate', Function);
			assert.argumentIsOptional(canProcessPredicate, 'canProcessPredicate', Function);

			return new DelegatedMessageProcessor(processDelegate, canProcessPredicate);
		}

		/**
		 * Creates a {@link MessageProcessor} which can be used to handle
		 * "proxy" events from the API Gateway. In other words, the
		 * {@link MessageProcessor#canProcess} function will verify the
		 * event's "httpMethod" property and its "resourceProperty" match
		 * the arguments provided here.
		 *
		 * @public
		 * @param {Function} processDelegate - The handler.
		 * @param {String=} resourceExpression - A regular expression that must match the message.resource (e.g. "v1/ponies/{color}")
		 * @param {Array<Verb>=} methods - The methods supported by the handler.
		 * @returns {MessageProcessor}
		 */
		static forApiGateway(processDelegate, resourceExpression, methods) {
			return new ApiGatewayMessageProcessor(processDelegate, resourceExpression, methods);
		}

		toString() {
			return '[LambdaRouter]';
		}
	}

	class DelegatedMessageProcessor extends MessageProcessor {
		constructor(processDelegate, canProcessPredicate) {
			super();

			this._processDelegate = processDelegate;
			this._canProcessPredicate = canProcessPredicate;
		}

		_canProcess(message, environment, components, logger) {
			return this._canProcessPredicate(message, environment, components, logger);
		}

		_process(message, environment, components, logger) {
			return this._processDelegate(message, environment, components, logger);
		}

		toString() {
			return '[DelegatedMessageProcessor]';
		}
	}

	class ApiGatewayMessageProcessor extends MessageProcessor {
		constructor(processDelegate, resourceExpression, methods) {
			super();

			assert.argumentIsRequired(processDelegate, 'processDelegate', Function);
			assert.argumentIsOptional(resourceExpression, 'resourceExpression', String);
			assert.argumentIsArray(methods, 'methods', String);

			this._processDelegate = processDelegate;
			this._resourceExpression = new RegExp(resourceExpression || '.*');
			this._methods = methods || [ Verb.DELETE, Verb.GET, Verb.OPTIONS, Verb.POST, Verb.PUT ];
		}

		_canProcess(message, environment, components, logger) {
			return is.object(message) &&
				is.string(message.httpMethod) &&
				is.string(message.path) &&
				this._methods.some(m => m.code === message.httpMethod) &&
				this._resourceExpression.test(message.resource);
		}

		_process(message, environment, components, logger) {
			return this._processDelegate(message, environment, components, logger);
		}
	}

	return MessageProcessor;
})();