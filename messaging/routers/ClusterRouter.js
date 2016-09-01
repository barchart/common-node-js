var log4js = require('log4js');
var cluster = require('cluster');
var process = require('process');
var uuid = require('uuid');

var Event = require('common/messaging/Event');
var Disposable = require('common/lang/Disposable');
var DisposableStack = require('common/collections/specialized/DisposableStack');
var is = require('common/lang/is');
var random = require('common/lang/random');

var Receiver = require('./../../cluster/Receiver');
var Router = require('./Router');
var Sender = require('./../../cluster/Sender');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/messaging/routers/ClusterRouter');

	const REGISTER = 'r.r';
	const UNREGISTER = 'r.u';
	const REQUEST = 'r.q';
	const RESPONSE = 'r.s';

	class ClusterRouter extends Router {
		constructor() {
			super();

			this._requestHandlers = { };
			this._requestRegistrations = { };
			this._pendingCallbacks = { };

			this._sender = Sender.getInstance();
			this._reciver = Receiver.getInstance();

			this._disposeStack = new DisposableStack();
		}

		_start() {
			return this._startPromise = Promise.all(this._sender.start(), this._reciver.start())
				.then(() => {
					this._disposeStack.push(this._reciver.addHandler(REGISTER, (source, type, payload) => {
						const messageType = payload.t;

						if (!this._requestRegistrations.hasOwnProperty(messageType)) {
							this._requestRegistrations[messageType] = [ ];
						}

						const registrations = this._requestRegistrations[messageType];

						if (!registrations.includes(source)) {
							registrations.push(source);
						} else {
							logger.warn('A registration for', messageType, 'aleady exists for worker', source);
						}
					}));

					this._disposeStack.push(this._reciver.addHandler(UNREGISTER, (source, type, payload) => {
						const messageType = payload.t;

						if (this._requestRegistrations.hasOwnProperty(messageType)) {
							this._requestRegistrations[messageType] = this._requestRegistrations[messageType].filter((item) => {
								return item !== source;
							});

							if (this._requestRegistrations[messageType].length === 0) {
								delete this._requestRegistrations[messageType];
							}
						}
					}));

					this._disposeStack.push(this._reciver.addHandler(REQUEST, (source, type, payload) => {
						const requestType = payload.t;
						const requestPayload = payload.p;

						const handler = this._requestHandlers[requestType];

						Promise.resolve()
							.then(() => {
								let response;

								if (is.fn(handler)) {
									response = handler(requestPayload);
								} else {
									logger.warn('Unable to handle', requestType, 'request. No request handler exists. Sending reject.');

									response = null;
								}

								return response;
							}).catch((e) => {
							logger.error('Request handler for', requestType, 'failed', e);

							return null;
						}).then((response) => {
							this._sender.send(RESPONSE, getResponseEnvelope(payload, response), source);
						});
					}));

					this._disposeStack.push(this._reciver.addHandler(RESPONSE, (source, type, payload) => {
						const requestId = payload.id;
						const callbacks = this._pendingCallbacks[requestId];

						if (callbacks) {
							const responsePayload = payload.p;

							if (responsePayload !== null) {
								callbacks.resolve(responsePayload);
							} else {
								callbacks.reject();
							}

							delete this._pendingCallbacks[requestId];
						}
					}));
				});

		}

		_canRoute(messageType) {
			return this._requestRegistrations.hasOwnProperty(messageType);
		}

		_route(messageType, payload) {
			return new Promise((resolveCallback, rejectCallback) => {
				const envelope = getRequestEnvelope(messageType, payload);

				this._pendingCallbacks[envelope.id] = {
					resolve: resolveCallback,
					reject: rejectCallback
				};

				const registrations = this._requestRegistrations[messageType];

				let index;

				if (registrations.length === 1) {
					index = 0;
				} else {
					index = random.range(0, registrations.length);
				}

				this._sender.send(REQUEST, getRequestEnvelope(messageType, payload), registrations[index]);
			});
		}

		_register(messageType, handler) {
			this._requestHandlers[messageType] = handler;

			this.sender.broadcast(REGISTER, { t: messageType });

			return Disposable.fromAction(() => {
				this.sender.broadcast(UNREGISTER, { t: messageType });

				delete this._requestHandlers[messageType];
			});
		}

		_onDispose() {
			this._disposeStack.dispose();
			this._disposeStack = null;

			this._requestHandlers = null;
			this._requestRegistrations = null;
			this._pendingCallbacks = null;

			logger.debug('Cluster router disposed');
		}

		toString() {
			return '[ClusterRouter]';
		}
	}

	function getRequestEnvelope(type, payload) {
		return {
			id: uuid.v4(),
			t: type,
			p: payload || null
		};
	}

	function getResponseEnvelope(request, response) {
		return {
			id: request.id,
			p: response || null
		};
	}

	return ClusterRouter;
})();