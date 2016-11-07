var _ = require('lodash');
var log4js = require('log4js');
var uuid = require('uuid');
var when = require('when');

var assert = require('common/lang/assert');
var Event = require('common/messaging/Event');
var EventMap = require('common/messaging/EventMap');
var Disposable = require('common/lang/Disposable');
var DisposableStack = require('common/collections/specialized/DisposableStack');

var Publisher = require('./Publisher');
var SnsProvider = require('./../../aws/SnsProvider');
var SqsProvider = require('./../../aws/SqsProvider');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('common-node/messaging/publishers/AwsPublisher');

	var AwsPublisher = Publisher.extend({
		init: function(snsProvider, sqsProvider, suppressEcho, suppressExpressions) {
			assert.argumentIsRequired(snsProvider, 'snsProvider', SnsProvider, 'SnsProvider');
			assert.argumentIsRequired(sqsProvider, 'sqsProvider', SqsProvider, 'SqsProvider');
			assert.argumentIsOptional(suppressEcho, 'suppressEcho', Boolean);

			this._super(suppressExpressions);

			this._snsProvider = snsProvider;
			this._sqsProvider = sqsProvider;

			this._suppressEcho = suppressEcho || false;

			this._publisherId = uuid.v4();

			this._subscriptionPromises = {};
		},

		_start: function() {
			var that = this;

			logger.debug('AWS publisher starting');

			return when.join(that._snsProvider.start(), that._sqsProvider.start())
				.then(function(ignored) {
					logger.debug('AWS publisher started');
				});
		},

		_publish: function(messageType, payload) {
			var that = this;

			var envelope = {
				publisher: this._publisherId,
				payload: payload
			};
			
			var qualifier = getQualifier(messageType);
			
			if (qualifier !== null) {
				envelope.qualifier = qualifier;
			}

			logger.debug('Publishing message to AWS:', messageType);
			logger.trace(payload);

			return that._snsProvider.publish(getTopic(messageType), envelope);
		},

		_subscribe: function(messageType, handler) {
			var that = this;

			logger.debug('Subscribing to AWS messages:', messageType);
			
			var topic = getTopic(messageType);
			var qualifier = getQualifier(messageType);

			if (!_.has(that._subscriptionPromises, topic)) {
				var subscriptionStack = new DisposableStack();

				var subscriptionEvent = new Event(that);
				var subscriptionEvents = new EventMap(that);

				var subscriptionQueueName = getSubscriptionQueue.call(that, topic);

				subscriptionStack.push(subscriptionEvent);
				subscriptionStack.push(subscriptionEvents);

				that._subscriptionPromises[topic] = when.join(
					that._snsProvider.getTopicArn(topic),
					that._sqsProvider.getQueueArn(subscriptionQueueName))
						.then(function(resultGroup) {
							var topicArn = resultGroup[0];
							var queueArn = resultGroup[1];

							subscriptionStack.push(Disposable.fromAction(function() {
								that._sqsProvider.deleteQueue(subscriptionQueueName);
							}));

							return that._sqsProvider.setQueuePolicy(subscriptionQueueName, SqsProvider.getPolicyForSnsDelivery(queueArn, topicArn))
								.then(function() {
									return that._snsProvider.subscribe(topic, queueArn);
								});
						}).then(function(queueBinding) {
							subscriptionStack.push(queueBinding);

							return that._sqsProvider.observe(subscriptionQueueName, function(envelope) {
								if (!_.isObject(envelope) || !_.isString(envelope.Message)) {
									return;
								}

								var message = JSON.parse(envelope.Message);

								var content;
								var echo;

								if (_.isString(message.publisher) && _.isObject(message.payload)) {
									content = message.payload;
									echo = message.publisher === that._publisherId;
								} else {
									content = message;
									echo = false;
								}

								if (!echo || !that._suppressEcho) {
									subscriptionEvent.fire(content);

									if (_.isString(message.qualifier)) {
										subscriptionEvents.fire(message.qualifier, content);
									}
								} else {
									logger.debug('AWS publisher dropped an "echo" message for', messageType);
								}
							}, 100, 20000, 10);
						}).then(function(queueObserver) {
							subscriptionStack.push(queueObserver);

							subscriptionStack.push(Disposable.fromAction(function() {
								delete that._subscriptionPromises[messageType];
							}));

							return {
								binding: subscriptionStack,
								event: subscriptionEvent,
								events: subscriptionEvents
							};
						});
			}

			return that._subscriptionPromises[messageType]
				.then(function(subscriberData) {
					var h = function(data, ignored) {
						handler(data);
					};

					var binding;

					if (qualifier) {
						binding = subscriberData.event.register(h);
					} else {
						binding = subscriberData.events.register(qualifier, h);
					}

					return binding;
				});
		},

		_onDispose: function() {
			var that = this;

			var subscriptionPromises = _.clone(that._subscriptionPromises);
			that._subscriptionPromises = null;

			when.map(subscriptionPromises, function(subscriptionData) {
				subscriptionData.binding.dispose();
			});

			logger.debug('AWS publisher disposed');
		},

		toString: function() {
			return '[AwsPublisher]';
		}
	});

	var messageTypeRegex = new RegExp('(.*)#(.*)$');

	function getSubscriptionQueue(topic) {
		return topic + '-' + this._publisherId;
	}

	function getTopic(messageType) {
		var matches = messageType.match(messageTypeRegex);
		
		if (matches !== null) {
			return matches[1];
		} else {
			return messageType;
		}
	}

	function getQualifier(messageType) {
		var matches = messageType.match(messageTypeRegex);

		if (matches !== null) {
			return matches[2];
		} else {
			return null;
		}
	}
	
	return AwsPublisher;
}();