const log4js = require('log4js');

const assert = require('@barchart/common-js/lang/assert'),
	is = require('@barchart/common-js/lang/is');

const Verb = require('./../../network/http/Verb');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('lambda/LambdaProcessor');

	/**
	 * A function wrapper for processing Lambdas coupled with a
	 * predicate to determine if the instance *can* process the
	 * input.
	 *
	 * @public
	 * @interface
	 */
	class LambdaProcessor {
		constructor() {

		}

		/**
		 * Returns true if the arguments could be handled by the {LambdaProcessor#process},
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
		 * Returns a {@link LambdaProcessor} that is backed by functions.
		 *
		 * @param {Function} processDelegate
		 * @param {Function=} canProcessPredicate
		 * @returns {LambdaProcessor}
		 */
		static fromFunction(processDelegate, canProcessPredicate) {
			assert.argumentIsRequired(processDelegate, 'processDelegate', Function);
			assert.argumentIsOptional(canProcessPredicate, 'canProcessPredicate', Function);

			return new DelegatedLambdaProcessor(processDelegate, canProcessPredicate);
		}

		/**
		 * Returns a {@link LambdaProcessor} implements "canProcess" logic
		 * by looking at the HTTP verb and path of an event generated from
		 * a proxied request to the API gateway.
		 *
		 * @param {Function} processDelegate - The handler.
		 * @param {String=} pathExpression - The regular expression, tested against the path, that must match for the processor to be executed.
		 * @param {Array<String>=} methods - The HTTP methods supported by the processor.
		 * @returns {LambdaProcessor}
		 */
		static forApiGatewayProxyRequest(processDelegate, pathExpression, ...methods) {
			return new ApiGatewayProxyLambdaProcessor(processDelegate, pathExpression, methods);
		}

		toString() {
			return '[LambdaRouter]';
		}
	}

	class DelegatedLambdaProcessor extends LambdaProcessor {
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
			return '[DelegatedLambdaProcessor]';
		}
	}

	class ApiGatewayProxyLambdaProcessor extends LambdaProcessor {
		constructor(processDelegate, pathExpression, methods) {
			super();

			assert.argumentIsRequired(processDelegate, 'processDelegate', Function);
			assert.argumentIsOptional(pathExpression, 'pathExpression', String);
			assert.argumentIsArray(methods, 'methods', String);

			this._processDelegate = processDelegate;
			this._pathExpression = new RegExp(pathExpression || '.*');
			this._methods = methods || [ Verb.DELETE.code, Verb.GET.code, Verb.OPTIONS.code, Verb.POST.code, Verb.PUT.code ];
		}

		_canProcess(message, environment, components, logger) {
			return is.object(message) && is.string(message.path) && this._methods.includes(message.httpMethod) && is.string(message.path) && this._pathExpression.test(message.path);
		}
	}

	return LambdaProcessor;
})();