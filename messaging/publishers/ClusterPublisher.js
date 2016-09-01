var log4js = require('log4js');

var Disposable = require('common/lang/Disposable');
var Event = require('common/messaging/Event');

var Publisher = require('./Publisher');
var Receiver = require('./../../cluster/Receiver');
var Sender = require('./../../cluster/Sender');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/messaging/publishers/ClusterPublisher');

	const SUBSCRIBE = 'p.s';
	const UNSUBSCRIBE = 'p.u';
	const PUBLISH = 'p.p';

	class ClusterPublisher extends Publisher {
		constructor() {
			super();

			this._bindings = {};
			this._subscribers = {};
			this._subscriptions = {};

			this._sender = Sender.getInstance();
			this._reciver = Receiver.getInstance();

			this._disposeStack = new DisposableStack();
		}

		_start() {
			return this._startPromise = Promise.all(this._sender.start(), this._reciver.start())
				.then(() => {
					this._disposeStack.push(this._reciver.addHandler(SUBSCRIBE, (source, type, payload) => {

					}));

					this._disposeStack.push(this._reciver.addHandler(UNSUBSCRIBE, (source, type, payload) => {

					}));

					this._disposeStack.push(this._reciver.addHandler(PUBLISH, (source, type, payload) => {

					}));
				});
		}

		_publish(messageType, payload) {

		}

		_subscribe(messageType, handler) {
			const id = uuid.v4();

			if (!this._subscribers.hasOwnProperty(messageType)) {
				this._subscribers[messageType] = new Event(this);
			}

			const registration = this._subscribers[messageType].register(getEventHandlerForSubscription(handler));

			const binding = Disposable.fromAction(() => {
				this._sender.broadcast(UNSUBSCRIBE, getSubscriptionEnvelope(id, messageType));

				registration.dispose();

				delete this._bindings[id];
			});

			this._bindings[id] = binding;

			this._sender.broadcast(SUBSCRIBE, getSubscriptionEnvelope(id, messageType));

			return binding;
		}

		_onDispose() {
			Object.keys(this._bindings).forEach((key) => {
				const binding = this._bindings[key];

				binding.dispose();
			});

			this._bindings = null;
			this._subscribers = null;
			this._subscriptions = null;

			logger.debug('Cluster publisher disposed');
		}

		toString() {
			return '[ClusterPublisher]';
		}
	}

	function getEventHandlerForSubscription(handler) {
		return (data, ignored) => {
			handler(data);
		};
	}

	function getSubscriptionEnvelope(id, type) {
		return {
			id: id,
			t: type
		};
	}

	return ClusterPublisher;
})();