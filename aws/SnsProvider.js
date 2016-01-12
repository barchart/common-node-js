var _ = require('lodash');
var aws = require('aws-sdk');
var when = require('when');
var log4js = require('log4js');

var assert = require('common/lang/assert');
var Disposable = require('common/lang/Disposable');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('common-node/messaging/SnsProvider');

	var SnsProvider = Disposable.extend({
		init: function(configuration) {
			assert.argumentIsRequired(configuration, 'configuration');
			assert.argumentIsRequired(configuration.region, 'configuration.region', String);
			assert.argumentIsOptional(configuration.apiVersion, 'configuration.apiVersion', String);

			this._super();

			this._sns = null;

			this._configuration = configuration;

			this._startPromise = null;
			this._started = false;

			this._topicPromises = { };
			this._subscriptionPromises = { };
		},

		start: function() {
			var that = this;

			if (that.getIsDisposed()) {
				throw new Error('The SNS Provider has been disposed.');
			}

			if (that._startPromise === null) {
				that._startPromise = when.try(function() {
					aws.config.update({ region: that._configuration.region });

					that._sns = new aws.SNS({ apiVersion: that._configuration.apiVersion || '2010-03-31' });
				}).then(function() {
					logger.debug('SNS provider started');

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

			if (!_.has(that._topicPromises, topicName)) {
				that._topicPromises[topicName] = when.promise(
					function(resolveCallback, rejectCallback) {
						logger.trace('Creating SNS topic:', topicName);

						that._sns.createTopic({
							Name: topicName
						}, function(error, data) {
							if (error === null) {
								logger.trace('SNS topic created:', topicName);

								resolveCallback(data.TopicArn);
							} else {
								logger.error('SNS topic creation failed:', topicName);
								logger.error(error);

								rejectCallback('Failed to create SNS topic.');
							}
						});
					}
				);
			}

			return that._topicPromises[topicName];
		},

		createTopic: function(topicName) {
			assert.argumentIsRequired(topicName, 'topicName', String);

			if (this.getIsDisposed()) {
				throw new Error('The SNS Provider has been disposed.');
			}

			if (!this._started) {
				throw new Error('The SNS Provider has not been started.');
			}

			return this.getTopicArn(topicName)
				.then(function(ignored) {
					return;
				});
		},

		deleteTopic: function(topicName) {
			assert.argumentIsRequired(topicName, 'topicName', String);

			if (this.getIsDisposed()) {
				throw new Error('The SNS Provider has been disposed.');
			}

			if (!this._started) {
				throw new Error('The SNS Provider has not been started.');
			}

			var that = this;

			return that.getTopicArn(topicName)
				.then(function(topicArn) {
					return when.promise(
						function(resolveCallback, rejectCallback) {
							logger.trace('Deleting SNS topic:', topicName);

							that._sns.deleteTopic({
								TopicArn: topicArn
							}, function(error, data) {
								if (error === null) {
									logger.trace('SNS topic deleted:', topicName);

									resolveCallback();
								} else {
									logger.error('SNS topic deletion failed:', topicName);
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

			return that.getTopicArn(topicName)
				.then(function(topicArn) {
					return when.promise(
						function(resolveCallback, rejectCallback) {
							logger.trace('Deleting SNS topic:', topicName);

							that._sns.publish({
								TopicArn: topicArn,
								Message: JSON.stringify(payload)
							}, function(error, data) {
								if (error === null) {
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

			if (!_.has(that._subscriptionPromises, topicName)) {
				that._subscriptionPromises[topicName] = that.getTopicArn(topicName)
					.then(function(topicArn) {
						return when.promise(
							function(resolveCallback, rejectCallback) {
								logger.trace('Subscribing SQS queue to SNS topic:', topicName);

								that._sns.subscribe({
									'TopicArn': topicArn,
									'Endpoint': queueArn,
									'Protocol': 'sqs'
								}, function(error, data) {
									if (error === null) {
										logger.debug('SNS subscription to SQS topic complete:', topicName);

										resolveCallback(Disposable.fromAction(function() {
											if (that.getIsDisposed()) {
												return;
											}

											logger.trace('Unsubscribing SQS queue from SNS topic:', topicName);

											delete that._subscriptionPromises[topicName];

											that._sns.unsubscribe({
												SubscriptionArn: data.SubscriptionArn
											}, function(error, data) {
												if (error === null) {
													logger.debug('SQS unsubscribe from SNS topic complete:', topicName);
												} else {
													logger.error('SQS unsubscribe from SNS topic failed:', topicName);
													logger.error(error);
												}
											});
										}));
									} else {
										logger.error('SNS subscription to SQS topic failed:', topicName);
										logger.error(error);

										rejectCallback('Failed to subscribe to SNS topic.');
									}
								});
							}
						);
					});
			}

			return that._subscriptionPromises[topicName];
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

	return SnsProvider;
}();