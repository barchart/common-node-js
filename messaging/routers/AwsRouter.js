var log4js = require('log4js');
var uuid = require('uuid');

var assert = require('common/lang/assert');
var Event = require('common/messaging/Event');
var Disposable = require('common/lang/Disposable');
var DisposableStack = require('common/collections/specialized/DisposableStack');
var is = require('common/lang/is');

var Router = require('./Router');
var SqsProvider = require('./../../aws/SqsProvider');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/messaging/routers/AwsRouter');

	class AwsRouter extends Router {
		constructor(sqsProvider) {
			super();

			assert.argumentIsRequired(sqsProvider, 'sqsProvider', SqsProvider, 'SqsProvider');

			this._sqsProvider = sqsProvider;

			this._pendingRequests = {};
			this._routerId = uuid.v4();

			this._requestHandlers = {};

			this._disposeStack = new DisposableStack();
		}

		_start() {
			logger.debug('AWS router starting');

			return Promise.resolve()
				.then(() => {
					return this._sqsProvider.start();
				}).then(() => {
					const responseQueueName = getResponseChannel(this._routerId);

					const responseObserver = this._sqsProvider.observe(responseQueueName, (message) => {
						if (is.string(message.id) && this._pendingRequests.hasOwnProperty(message.id)) {
							const resolveCallback = this._pendingRequests[message.id];

							delete this._pendingRequests[message.id];

							if (is.object(message.payload)) {
								resolveCallback(message.payload);
							}
						}
					}, 500, 20000);

					const responseQueueBinding = Disposable.fromAction(() => {
						this._sqsProvider.deleteQueue(responseQueueName);
					});

					this._disposeStack.push(responseQueueBinding);
					this._disposeStack.push(responseObserver);

					logger.debug('AWS router started');
				});
		}

		_canRoute(messageType) {
			return true;
		}

		_route(messageType, payload) {
			logger.debug('Routing message to AWS:', messageType);
			logger.trace(payload);

			const messageId = uuid.v4();

			const envelope = {
				id: messageId,
				sender: this._routerId,
				payload: payload
			};

			const routePromise = new Promise((resolveCallback, rejectedCallback) => {
				this._pendingRequests[messageId] = resolveCallback;
			});

			return this._sqsProvider.send(messageType, envelope)
				.then(() => {
					return routePromise;
				});
		}

		_register(messageType, handler) {
			logger.debug('Registering AWS handler for:', messageType);

			const registerObserver = this._sqsProvider.observe(messageType, (message) => {
				if (!is.string(message.id) || !is.object(message.payload) || !(is.string(message.sender) || message.sender === null)) {
					logger.warn('Dropping malformed request received from SQS queue (' + messageType + ').');
					return;
				}

				let handlerPromise = Promise.resolve()
					.then(() => {
						return handler(message.payload);
					});

				if (message.sender !== null) {
					handlerPromise = handlerPromise.then((response) => {
						const responseQueueName = getResponseChannel(message.sender);

						const envelope = {
							id: message.id,
							payload: response || {}
						};

						return this._sqsProvider.send(responseQueueName, envelope);
					});
				}

				handlerPromise = handlerPromise.catch((e) => {
					logger.error('Request processing failed. Unable to respond.', e);
				});

				return handlerPromise;
			});

			this._requestHandlers[messageType] = registerObserver;

			return registerObserver;
		}

		_onDispose() {
			this._disposeStack.dispose();

			logger.debug('AWS router disposed');
		}

		toString() {
			return '[AwsRouter]';
		}
	}

	function getResponseChannel(routerId) {
		return 'response-' + routerId;
	}

	return AwsRouter;
})();