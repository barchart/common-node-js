var log4js = require('log4js');
var cluster = require('cluster');
var process = require('process');
var uuid = require('uuid');

var Event = require('common/messaging/Event');
var Disposable = require('common/lang/Disposable');
var is = require('common/lang/is');
var random = require('common/lang/random');

var Router = require('./Router');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/messaging/routers/ClusterRouter');

	const REGISTER = 'r';
	const UNREGISTER = 'u';
	const REQUEST = 'rq';
	const RESPONSE = 'rs';

	class ClusterRouter extends Router {
		constructor() {
			super();

			this._requestHandlers = { };
			this._requestRegistrations = { };
			this._pendingCallbacks = { };

			this._startPromise = null;

			this._sender = null;
		}

		_start() {
			const handlers = { };

			handlers[REGISTER] = (source, type, payload) => {
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
			};

			handlers[UNREGISTER] = (source, type, payload) => {
				const messageType = payload.t;

				if (this._requestRegistrations.hasOwnProperty(messageType)) {
					this._requestRegistrations[messageType] = this._requestRegistrations[messageType].filter((item) => {
						return item !== source;
					});

					if (this._requestRegistrations[messageType].length === 0) {
						delete this._requestRegistrations[messageType];
					}
				}
			};

			handlers[REQUEST] = (source, type, payload) => {
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
			};

			handlers[RESPONSE] = (source, type, payload) => {
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
			};

			let sender;
			let receiver;

			if (cluster.isWorker) {
				sender = new WorkerSender();
				receiver = new WorkerReciever(handlers);
			} else {
				sender = new MasterSender();
				receiver = new MasterReceiver(handlers);
			}

			this._sender = sender;

			return sender.start()
				.then(() => {
					receiver.start();
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

	class Receiver {
		constructor(handlers) {
			this._handlers = handlers;

			this._startPromise = null;
		}

		start() {
			if (this._startPromise === null) {
				this._startPromise = Promise.resolve()
					.then(() => {
						return this._start(this._handlers);
					}).then(() => {
						return this;
					});
			}

			return this._startPromise;
		}

		_start(handlers) {
			return;
		}
	}

	class MasterReceiver extends Receiver {
		constructor(handlers) {
			super(handlers);
		}

		_start(handlers) {
			Object.keys(cluster.workers, (id) => {
				const worker = cluster.workers[id];

				worker.on('messasge', (message) => {
					const envelope = JSON.parse(message);
					const handler = handlers[envelope.t];

					if (handler) {
						handler(envelope.s, envelope.t, envelope.p);
					}
				});
			});
		}
	}

	class WorkerReciever {
		constructor(handlers) {
			super(handlers);
		}

		_start(handlers) {
			Object.keys(cluster.workers, (id) => {
				const worker = cluster.workers[id];

				process.on('messasge', (message) => {
					const envelope = JSON.parse(message);
					const handler = handlers[envelope.t];

					if (handler) {
						handler(envelope.s, envelope.t, envelope.p);
					}
				});
			});
		}
	}

	class Sender {
		constructor(id) {
			this._id = id || null;

			this._startPromise = null;
		}

		start() {
			if (this._startPromise === null) {
				this._startPromise = Promise.resolve()
					.then(() => {
						return this._start();
					}).then(() => {
						return this;
					});
			}

			return this._startPromise;
		}

		_start() {
			return;
		}

		send(type, payload, target) {
			return;
		}

		broadcast(type, payload) {
			return;
		}

		getMessage(type, payload) {
			return JSON.stringify({
				s: this._id,
				t: type,
				p: payload || { }
			});
		}

		toString() {
			return '[ClusterRouter.Sender]';
		}
	}

	class MasterSender extends Sender {
		constructor() {
			super(0);
		}

		start(callbacks) {
			if (this._startPromise === null) {
				this._startPromise = new Promise((resolveCallback, rejectCallback) => {

				});
			}

			return this._startPromise;
		}

		send(type, payload, target) {
			cluster.workers[target].send(this.getMessage(type, payload));
		}

		broadcast(type, payload) {
			const message = Sender.getMessage(type, payload);

			Object.keys(cluster.workers, (id) => {
				cluster.workers[id].send(message);
			});
		}

		toString() {
			return '[ClusterRouter.MasterSender]';
		}
	}

	class WorkerSender extends Sender {
		constructor() {
			super(cluster.worker.id);
		}

		send(type, payload, target) {
			if (this._id === null) {
				throw new Error('Unable to send message without worker identifier.');
			}

			process.send(this.getMessage(type, payload));
		}

		broadcast(type, payload) {
			send(type, payload);
		}

		toString() {
			return '[ClusterRouter.WorkerSender]';
		}
	}

	return ClusterRouter;
})();