var log4js = require('log4js');
var cluster = require('cluster');
var process = require('process');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/cluster/Sender');

	let instance = null;

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
			return '[Sender]';
		}

		static getInstance() {
			if (instance === null) {
				if (cluster.isWorker) {
					instance = new WorkerSender();
				} else {
					instance = new MasterSender();
				}
			}

			return instance;
		}
	}

	class MasterSender extends Sender {
		constructor() {
			super(0);
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
			return '[MasterSender]';
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
			return '[WorkerSender]';
		}
	}

	return Sender;
})();