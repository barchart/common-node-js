const assert = require('@barchart/common-js/lang/assert');

const MessageProcessor = require('./MessageProcessor');

module.exports = (() => {
	'use strict';

	/**
	 * A {@link MessageProcessor} implementation that cycles through an
	 * internal list of {@link MessageProcessor} instances and executes
	 * the first valid instance.
	 *
	 * @public
	 * @param {Array<MessageProcessor>}
	 * @extends MessageProcessor
	 */
	class MessageRouter extends MessageProcessor {
		constructor(processors) {
			super();

			assert.argumentIsOptional(processors, 'processors', Array, 'Array');

			if (processors) {
				assert.argumentIsArray(processors, 'processors', MessageProcessor, 'MessageProcessor');
			}

			this._processors = processors || [ ];
		}

		_canProcess(message, environment, components, logger) {
			return this._processors.some(p => p.canProcess(message, environment, components, logger));
		}

		_process(message, environment, components, logger) {
			const processor = this._processors.find(p => p.canProcess(message, environment, components, logger));

			return processor.process(message, environment, components, logger);
		}

		/**
		 * Adds a {@link MessageProcessor} and returns the current instance.
		 *
		 * @public
		 * @param {MessageProcessor} processor
		 * @returns {MessageRouter}
		 */
		usingProcessor(processor) {
			assert.argumentIsRequired(processor, 'processor', MessageProcessor, 'MessageProcessor');

			this._processors.push(processor);

			return this;
		}

		/**
		 * Adds a {@link MessageProcessor} for an API Gateway request to the
		 * router and returns the current instance.
		 *
		 * @public
		 * @param {Function} processDelegate - The handler.
		 * @param {String=} resourceExpression - A regular expression that must match the message.resource (e.g. "v1/ponies/{color}")
		 * @param {Array<Verb>=} methods - The methods supported by the handler.
		 * @returns {MessageRouter}
		 */
		routeApiGatewayRequest(processDelegate, resourceExpression, ...methods) {
			return this.usingProcessor(MessageProcessor.forApiGateway(processDelegate, resourceExpression, methods));
		}

		toString() {
			return `[MessageRouter]`;
		}
	}

	return MessageRouter;
})();