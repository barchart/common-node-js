var _ = require('lodash');
var log4js = require('log4js');
var uuid = require('uuid');
var when = require('when');

var assert = require('common/lang/assert');
var Event = require('common/messaging/Event');
var Disposable = require('common/lang/Disposable');
var DisposableStack = require('common/collections/specialized/DisposableStack');

var Publisher = require('./Publisher');
var SnsProvider = require('./../../aws/SnsProvider');
var SqsProvider = require('./../../aws/SqsProvider');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('common-node/messaging/publishers/AwsPublisher');

	var AwsPublisher = Publisher.extend({
		init: function(snsProvider, sqsProvider, suppressEcho) {
			assert.argumentIsRequired(snsProvider, 'snsProvider', SnsProvider, 'SnsProvider');
			assert.argumentIsRequired(sqsProvider, 'sqsProvider', SqsProvider, 'SqsProvider');
			assert.argumentIsOptional(suppressEcho, 'suppressEcho', Boolean);
			
			this._super();

			this._snsProvider = snsProvider;
			this._sqsProvider = sqsProvider;
			
			this._suppressEcho = suppressEcho || false;

			this._publisherId = uuid.v4();

			this._subscriptionPromises = { };
		},

		_start: function() {
			var that = this;

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

			that._snsProvider.publish(messageType, envelope);
		},

		_subscribe: function(messageType, handler) {
			var that = this;

			if (!_.has(that._subscriptionPromises, messageType)) {
				var subscriptionStack = new DisposableStack();

				var subscriptionEvent = new Event(that);
				var subscriptionQueueName = getSubscriptionQueue.call(that, messageType);

				subscriptionStack.push(subscriptionEvent);

				that._subscriptionPromises[messageType] = when.join(
					that._snsProvider.getTopicArn(messageType),
					that._sqsProvider.getQueueArn(subscriptionQueueName))
						.then(function(resultGroup) {
							var topicArn = resultGroup[0];
							var queueArn = resultGroup[1];

							subscriptionStack.push(Disposable.fromAction(function() {
								that._sqsProvider.deleteQueue(subscriptionQueueName);
							}));

							return that._sqsProvider.setQueuePolicy(subscriptionQueueName, SqsProvider.getPolicyForSnsDelivery(queueArn, topicArn))
								.then(function() {
									return that._snsProvider.subscribe(messageType, queueArn);
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
								} else {
									logger.debug('AWS publisher dropped an "echo" message for', messageType);
								}
							});
						}).then(function(queueObserver) {
							subscriptionStack.push(queueObserver);

							subscriptionStack.push(Disposable.fromAction(function() {
								delete that._subscriptionPromises[messageType];
							}));

							return {
								binding: subscriptionStack,
								event: subscriptionEvent
							};
						});
			}
			
			return that._subscriptionPromises[messageType]
				.then(function(subscriberData) {
					return subscriberData.event.register(function(data, ignored) {
						handler(data);
					});
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

	function getSubscriptionQueue(messageType) {
		return messageType + '-subscriber-' + this._publisherId;
	}

	return AwsPublisher;
}();