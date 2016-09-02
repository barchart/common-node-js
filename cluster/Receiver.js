var log4js = require('log4js');
var cluster = require('cluster');
var process = require('process');

var assert = require('common/lang/assert');
var Disposable = require('common/lang/Disposable');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/cluster/Receiver');

	let instance = null;

	class Receiver {
		constructor() {
			this._handlers = { };

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

		addHandler(type, handler) {
			assert.argumentIsRequired(type, 'type', String);
			assert.argumentIsRequired(handler, 'handler', Function);

			if (this._handlers.hasOwnProperty(type)) {
				throw new Error('Unable to add new handler for ' + type + ' to cluster receiver, a handler for that type already exists.');
			}

			this._handlers[type] = handler;

			return Disposable.fromAction(() => {
				delete this._handlers[type];
			});
		}

		toString() {
			return '[Reciever]';
		}

		static getInstance() {
			if (instance === null) {
				if (cluster.isWorker) {
					instance = new WorkerReceiver();
				} else {
					instance = new MasterReceiver();
				}
			}

			return instance;
		}
	}

	class MasterReceiver extends Receiver {
		constructor() {
			super();
		}

		_start(handlers) {
			const connectToWorker = (worker) => {
				logger.info('Master listening on IPC channel to messages from worker', worker.id);

				worker.on('message', (message) => {
					logger.trace('Master received message from worker process', worker.id, message);

					const envelope = JSON.parse(message);
					const handler = this._handlers[envelope.t];

					if (handler) {
						handler(envelope.s, envelope.t, envelope.p);
					}
				});
			};

			cluster.on('online', (worker) => {
				connectToWorker(worker);
			});

			Object.keys(cluster.workers).forEach((id) => {
				connectToWorker(cluster.workers[id]);
			});
		}
	}

	class WorkerReceiver extends Receiver {
		constructor() {
			super();
		}

		_start(handlers) {
			process.on('message', (message) => {
				logger.trace('Worker process', cluster.worker.id, 'received message from master process', message);

				const envelope = JSON.parse(message);
				const handler = this._handlers[envelope.t];

				if (handler) {
					handler(envelope.s, envelope.t, envelope.p);
				}
			});
		}
	}

	return Receiver;
})();