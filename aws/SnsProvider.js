var _ = require('lodash');
var aws = require('aws-sdk');
var when = require('when');
var log4js = require('log4js');

var assert = require('common/lang/assert');
var Disposable = require('common/lang/Disposable');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('common-node/aws/SnsProvider');

	var SnsProvider = Disposable.extend({
		init: function(configuration) {
			assert.argumentIsRequired(configuration, 'configuration');
			assert.argumentIsRequired(configuration.region, 'configuration.region', String);
			assert.argumentIsRequired(configuration.prefix, 'configuration.prefix', String);
			assert.argumentIsOptional(configuration.apiVersion, 'configuration.apiVersion', String);

			this._super();

			this._sns = null;

			this._configuration = configuration;

			this._startPromise = null;
			this._started = false;

			this._topicPromises = {};
			this._subscriptionPromises = {};
		},

		start: function() {
			var that = this;

			if (that.getIsDisposed()) {
				throw new Error('The SNS Provider has been disposed.');
			}

			if (that._startPromise === null) {
				that._startPromise = when.try(function() {
					aws.config.update({region: that._configuration.region});

					that._sns = new aws.SNS({apiVersion: that._configuration.apiVersion || '2010-03-31'});
				}).then(function() {
					logger.info('SNS provider started');

					that._started = true;

					return that._started;
				}).catch(function(e) {
					logger.error('SNS provider failed to start', e);

					throw e;
				});
			}

			return that._startPromise;
		},

		getTopicArn: function(topicName) {
			assert.argumentIsRequired(topicName, 'topicName', String);

			var that = this;

			if (that.getIsDisposed()) {
				throw new Error('The SNS Provider has been disposed.');
			}

			if (!that._started) {
				throw new Error('The SNS Provider has not been started.');
			}

			var qualifiedTopicName = getQualifiedTopicName(that._configuration.prefix, topicName);

			if (!_.has(that._topicPromises, qualifiedTopicName)) {
				logger.debug('The SNS Provider has not cached the topic ARN. Issuing request to create topic.');

				that._topicPromises[qualifiedTopicName] = that.createTopic(topicName);
			}

			return that._topicPromises[qualifiedTopicName];
		},

		createTopic: function(topicName) {
			assert.argumentIsRequired(topicName, 'topicName', String);

			var that = this;

			if (that.getIsDisposed()) {
				throw new Error('The SNS Provider has been disposed.');
			}

			if (!that._started) {
				throw new Error('The SNS Provider has not been started.');
			}

			return when.promise(
				function(resolveCallback, rejectCallback) {
					var qualifiedTopicName = getQualifiedTopicName(that._configuration.prefix, topicName);

					logger.debug('Creating SNS topic:', qualifiedTopicName);

					that._sns.createTopic({
						Name: qualifiedTopicName
					}, function(error, data) {
						if (error === null) {
							logger.info('SNS topic created:', qualifiedTopicName);

							resolveCallback(data.TopicArn);
						} else {
							logger.error('SNS topic creation failed:', qualifiedTopicName);
							logger.error(error);

							rejectCallback('Failed to create SNS topic.');
						}
					});
				}
			);
		},

		deleteTopic: function(topicName) {
			assert.argumentIsRequired(topicName, 'topicName', String);

			var that = this;

			if (that.getIsDisposed()) {
				throw new Error('The SNS Provider has been disposed.');
			}

			if (!that._started) {
				throw new Error('The SNS Provider has not been started.');
			}

			return that.getTopicArn(topicName)
				.then(function(topicArn) {
					var qualifiedTopicName = getQualifiedTopicName(that._configuration.prefix, topicName);

					return when.promise(
						function(resolveCallback, rejectCallback) {
							logger.debug('Deleting SNS topic:', qualifiedTopicName);

							that._sns.deleteTopic({
								TopicArn: topicArn
							}, function(error, data) {
								if (error === null) {
									logger.info('SNS topic deleted:', qualifiedTopicName);

									resolveCallback();
								} else {
									logger.error('SNS topic deletion failed:', qualifiedTopicName);
									logger.error(error);

									rejectCallback('Failed to delete SNS topic.');
								}
							});
						}
					);
				});
		},

		publish: function(topicName, payload) {
			assert.argumentIsRequired(topicName, 'topicName', String);
			assert.argumentIsRequired(payload, 'payload', Object);

			var that = this;

			if (that.getIsDisposed()) {
				throw new Error('The SNS Provider has been disposed.');
			}

			if (!that._started) {
				throw new Error('The SNS Provider has not been started.');
			}

			return that.getTopicArn(topicName)
				.then(function(topicArn) {
					var qualifiedTopicName = getQualifiedTopicName(that._configuration.prefix, topicName);

					return when.promise(
						function(resolveCallback, rejectCallback) {
							logger.debug('Publishing to SNS topic:', qualifiedTopicName);
							logger.trace(payload);

							that._sns.publish({
								TopicArn: topicArn,
								Message: JSON.stringify(payload)
							}, function(error, data) {
								if (error === null) {
									logger.info('Published to SNS topic:', qualifiedTopicName);

									resolveCallback();
								} else {
									logger.error(error);

									rejectCallback('Failed to publish message to SNS topic.');
								}
							});
						}
					);
				});
		},

		subscribe: function(topicName, queueArn) {
			assert.argumentIsRequired(topicName, 'topicName', String);
			assert.argumentIsRequired(queueArn, 'queueArn', String);

			var that = this;

			if (that.getIsDisposed()) {
				throw new Error('The SNS Provider has been disposed.');
			}

			if (!that._started) {
				throw new Error('The SNS Provider has not been started.');
			}

			var qualifiedTopicName = getQualifiedTopicName(that._configuration.prefix, topicName);

			if (!_.has(that._subscriptionPromises, qualifiedTopicName)) {
				that._subscriptionPromises[qualifiedTopicName] = that.getTopicArn(topicName)
					.then(function(topicArn) {
						return when.promise(
							function(resolveCallback, rejectCallback) {
								logger.debug('Subscribing SQS queue to SNS topic:', qualifiedTopicName);

								that._sns.subscribe({
									'TopicArn': topicArn,
									'Endpoint': queueArn,
									'Protocol': 'sqs'
								}, function(error, data) {
									if (error === null) {
										logger.info('SNS subscription to SQS topic complete:', qualifiedTopicName);

										resolveCallback(Disposable.fromAction(function() {
											if (that.getIsDisposed()) {
												return;
											}

											logger.debug('Unsubscribing SQS queue from SNS topic:', qualifiedTopicName);

											delete that._subscriptionPromises[qualifiedTopicName];

											that._sns.unsubscribe({
												SubscriptionArn: data.SubscriptionArn
											}, function(error, data) {
												if (error === null) {
													logger.info('SQS unsubscribe from SNS topic complete:', qualifiedTopicName);
												} else {
													logger.error('SQS unsubscribe from SNS topic failed:', qualifiedTopicName);
													logger.error(error);
												}
											});
										}));
									} else {
										logger.error('SNS subscription to SQS topic failed:', qualifiedTopicName);
										logger.error(error);

										rejectCallback('Failed to subscribe to SNS topic.');
									}
								});
							}
						);
					});
			}

			return that._subscriptionPromises[qualifiedTopicName];
		},

		_onDispose: function() {
			this._sns = null;

			this._topicPromises = null;
			this._subscriptionPromises = null;

			logger.debug('SNS provider disposed');
		},

		toString: function() {
			return '[SnsProvider]';
		}
	});

	function getQualifiedTopicName(prefix, topicName) {
		return sanitizedName(prefix + '-' + topicName);
	}

	function sanitizedName(messageType) {
		return messageType.replace('*', 'star')
			.replace('^', 'hat')
			.replace('.', 'dot');
	}

	return SnsProvider;
}();