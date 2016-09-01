var log4js = require('log4js');
var cluster = require('cluster');
var process = require('process');

var Disposable = require('common/lang/Disposable');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/cluster/Receiver');

	let instance;

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
			Object.keys(cluster.workers, (id) => {
				const worker = cluster.workers[id];

				worker.on('messasge', (message) => {
					const envelope = JSON.parse(message);
					const handler = this._handlers[envelope.t];

					if (handler) {
						handler(envelope.s, envelope.t, envelope.p);
					}
				});
			});
		}
	}

	class WorkerReciever extends Receiver {
		constructor() {
			super();
		}

		_start(handlers) {
			Object.keys(cluster.workers, (id) => {
				const worker = cluster.workers[id];

				process.on('messasge', (message) => {
					const envelope = JSON.parse(message);
					const handler = this._handlers[envelope.t];

					if (handler) {
						handler(envelope.s, envelope.t, envelope.p);
					}
				});
			});
		}
	}

	return Receiver;
})();