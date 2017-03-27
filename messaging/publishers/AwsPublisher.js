const log4js = require('log4js'),
	uuid = require('uuid');

const assert = require('common/lang/assert'),
	Event = require('common/messaging/Event'),
	Disposable = require('common/lang/Disposable'),
	DisposableStack = require('common/collections/specialized/DisposableStack'),
	is = require('common/lang/is');

const Publisher = require('./Publisher'),
	SnsProvider = require('./../../aws/SnsProvider'),
	SqsProvider = require('./../../aws/SqsProvider');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/messaging/publishers/AwsPublisher');

	class AwsPublisher extends Publisher {
		constructor(snsProvider, sqsProvider, suppressEcho, suppressExpressions) {
			super(suppressExpressions);

			assert.argumentIsRequired(snsProvider, 'snsProvider', SnsProvider, 'SnsProvider');
			assert.argumentIsRequired(sqsProvider, 'sqsProvider', SqsProvider, 'SqsProvider');
			assert.argumentIsOptional(suppressEcho, 'suppressEcho', Boolean);

			this._snsProvider = snsProvider;
			this._sqsProvider = sqsProvider;

			this._suppressEcho = suppressEcho || false;

			this._publisherId = uuid.v4();

			this._subscriptionPromises = {};
		}

		_start() {
			logger.debug('AWS publisher starting');

			return Promise.all([ this._snsProvider.start(), this._sqsProvider.start() ])
				.then((ignored) => {
					logger.debug('AWS publisher started');
				});
		}

		_publish(messageType, payload) {
			const envelope = {
				publisher: this._publisherId,
				payload: payload
			};

			logger.debug('Publishing message to AWS:', messageType);
			logger.trace(payload);

			return this._snsProvider.publish(messageType, envelope);
		}

		_subscribe(messageType, handler) {
			logger.debug('Subscribing to AWS messages:', messageType);

			if (!this._subscriptionPromises.hasOwnProperty(messageType)) {
				const subscriptionStack = new DisposableStack();

				const subscriptionEvent = new Event(this);
				const subscriptionQueueName = getSubscriptionQueue.call(this, messageType);

				subscriptionStack.push(subscriptionEvent);

				this._subscriptionPromises[messageType] = Promise.all([
					this._snsProvider.getTopicArn(messageType),
					this._sqsProvider.getQueueArn(subscriptionQueueName)])
						.then((resultGroup) => {
							const topicArn = resultGroup[0];
							const queueArn = resultGroup[1];

							subscriptionStack.push(Disposable.fromAction(() => {
								this._sqsProvider.deleteQueue(subscriptionQueueName);
							}));

							return this._sqsProvider.setQueuePolicy(subscriptionQueueName, SqsProvider.getPolicyForSnsDelivery(queueArn, topicArn))
								.then(() => {
									return this._snsProvider.subscribe(messageType, queueArn);
								});
						}).then((queueBinding) => {
							subscriptionStack.push(queueBinding);

							return this._sqsProvider.observe(subscriptionQueueName, (envelope) => {
								if (!is.object(envelope) || !is.string(envelope.Message)) {
									return;
								}

								const message = JSON.parse(envelope.Message);

								let content;
								let echo;

								if (is.string(message.publisher) && is.object(message.payload)) {
									content = message.payload;
									echo = message.publisher === this._publisherId;
								} else {
									content = message;
									echo = false;
								}

								if (!echo || !this._suppressEcho) {
									subscriptionEvent.fire(content);
								} else {
									logger.debug('AWS publisher dropped an "echo" message for', messageType);
								}
							}, 100, 20000, 10);
						}).then((queueObserver) => {
							subscriptionStack.push(queueObserver);

							subscriptionStack.push(Disposable.fromAction(() => {
								delete this._subscriptionPromises[messageType];
							}));

							return {
								binding: subscriptionStack,
								event: subscriptionEvent
							};
						});
			}

			return this._subscriptionPromises[messageType]
				.then((subscriberData) => {
					return subscriberData.event.register((data, ignored) => {
						handler(data);
					});
				});
		}

		_onDispose() {
			const subscriptionPromises = Object.assign(this._subscriptionPromises);
			this._subscriptionPromises = null;

			Object.keys(subscriptionPromises).forEach((key) => {
				const subscriptionPromise = subscriptionPromises[key];

				return subscriptionPromise.then((subscriptionData) => {
					subscriptionData.binding.dispose();
				});
			});

			logger.debug('AWS publisher disposed');
		}

		toString() {
			return '[AwsPublisher]';
		}
	}

	function getSubscriptionQueue(messageType) {
		return messageType + '-' + this._publisherId;
	}

	return AwsPublisher;
})();
