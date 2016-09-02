var log4js = require('log4js');
var cluster = require('cluster');
var process = require('process');

var Event = require('common/messaging/Event');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/cluster/Sender');

	let instance = null;

	class Sender {
		constructor(id) {
			this._id = id;

			this._connectionEvent = new Event(this);

			this._startPromise = null;
		}

		start() {
			if (this._startPromise === null) {
				this._startPromise = Promise.resolve()
					.then(() => {
						return this._start();
					}).then(() => {
						setInterval(() => {
							this.broadcast('ping', { time: (new Date()).getTime() });
						}, 2000);

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

		registerConnectionObserver(handler) {
			return this._connectionEvent.register(handler);
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

	function getMessage(id, type, payload) {
		return JSON.stringify({
			s: id,
			t: type,
			p: payload || { }
		});
	}

	class MasterSender extends Sender {
		constructor() {
			super(0);
		}

		_start() {
			cluster.on('online', (worker) => {
				this._connectionEvent.fire(worker.id);
			});

			Object.keys(cluster.workers).forEach((id) => {
				this._connectionEvent.fire(worker.id);
			});
		}

		send(type, payload, target) {
			cluster.workers[target].send(getMessage(this._id, type, payload));
		}

		broadcast(type, payload) {
			const message = getMessage(this._id, type, payload);

			Object.keys(cluster.workers).forEach((id) => {
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

		_start() {
			this._connectionEvent.fire(0);
		}

		send(type, payload, target) {
			if (this._id === null) {
				throw new Error('Unable to send message without worker identifier.');
			}

			process.send(getMessage(this._id, type, payload));
		}

		broadcast(type, payload) {
			this.send(type, payload, 0);
		}

		toString() {
			return '[WorkerSender]';
		}
	}

	return Sender;
})();