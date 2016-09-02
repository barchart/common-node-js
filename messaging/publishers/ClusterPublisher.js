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

			this._subscribers = {};
			this._subscriberBingings = {};
			
			this._subscriptions = {};

			this._sender = Sender.getInstance();
			this._reciver = Receiver.getInstance();

			this._disposeStack = new DisposableStack();
		}

		_start() {
			return this._startPromise = Promise.all(this._sender.start(), this._reciver.start())
				.then(() => {
					this._disposeStack.push(this._reciver.addHandler(SUBSCRIBE, (source, type, payload) => {
						const subscriptionId = payload.id;
						const messageType = payload.t;

						if (!this._subscriptions.hasOwnProperty(messageType)) {
							this._subscriptions[messageType] = new SubscriptionData(messageType);
						}

						const subscriptionData = this._subscriptions[messageType];

						subscriptionData.addSubscriber(subscriptionId, source);
					}));

					this._disposeStack.push(this._reciver.addHandler(UNSUBSCRIBE, (source, type, payload) => {
						const subscriptiontypeId = payload.id;
						const messageType = payload.t;

						if (this._subscriptions.hasOwnProperty(messageType)) {
							const subscriptionData = this._subscriptions[messageType];

							subscriptionData.removeSubscriber(subscriptionId);

							if (subscriptionData.getSources().length === 0) {
								delete this._subscriptions[messageType];
							}
						}
					}));

					this._disposeStack.push(this._reciver.addHandler(PUBLISH, (source, type, payload) => {
						const messageType = payload.t;

						if (this._subscribers.hasOwnProperty(messageType)) {
							this._subscribers[messageType].fire(payload.p);
						}
					}));
				});
		}

		_publish(messageType, payload) {
			if (this._subscriptions.hasOwnProperty(messageType)) {
				const envelope = getPublishEnvelope(messageType, payload);
				const sources = this._subscriptions[messageType].getSources();

				subscriptionData.getSources().forEach((source) => {
					this._sender.send(PUBLISH, envelope, source);
				});
			}
		}

		_subscribe(messageType, handler) {
			const id = uuid.v4();

			if (!this._subscribers.hasOwnProperty(messageType)) {
				this._subscribers[messageType] = new Event(this);
			}

			const registration = this._subscribers[messageType].register(getEventHandlerForSubscription(handler));

			const subscriberBinding = Disposable.fromAction(() => {
				this._sender.broadcast(UNSUBSCRIBE, getSubscriptionEnvelope(id, messageType));

				registration.dispose();

				delete this._subscriberBingings[id];
			});

			this._subscriberBingings[id] = subscriberBinding;

			this._sender.broadcast(SUBSCRIBE, getSubscriptionEnvelope(id, messageType));

			return subscriberBinding;
		}

		_onDispose() {
			Object.keys(this._subscriberBingings).forEach((key) => {
				const subscriberBinding = this._subscriberBingings[key];

				subscriberBinding.dispose();
			});

			this._subscriberBingings = null;
			this._subscribers = null;
			this._subscriptions = null;

			logger.debug('Cluster publisher disposed');
		}

		toString() {
			return '[ClusterPublisher]';
		}
	}

	class SubscriptionData {
		constructor(messageType) {
			this._messageType = messageType;

			this._subscribers = { };
			this._sources = [ ];
		}

		getMessageType() {
			return this._messageType;
		}

		addSubscriber(id, source) {
			this._subscribers[id] = source;

			if (!this._sources.includes(source)) {
				this._sources.push(source);
			}
		}

		removeSubscriber(id) {
			if (this._subscribers.hasOwnProperty(id)) {
				const source = this._subscribers[id];

				delete this._subscribers[id];

				if (!Object.keys(this._subscribers).some((key) => this._subscribers[key] === source)) {
					this._sources = this._sources.filter((canidate) => candidate !== source);
				}
			}
		}

		getSources() {
			return this._sources;
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

	function getPublishEnvelope(type, payload) {
		return {
			t: type,
			p: payload
		};
	}

	return ClusterPublisher;
})();