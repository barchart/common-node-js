var _ = require('lodash');
var aws = require('aws-sdk');
var when = require('when');
var log4js = require('log4js');

var assert = require('common/lang/assert');
var Disposable = require('common/lang/Disposable');
var Scheduler = require('common/timing/Scheduler');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('common-node/aws/SqsProvider');

	var SqsProvider = Disposable.extend({
		init: function(configuration) {
			assert.argumentIsRequired(configuration, 'configuration');
			assert.argumentIsRequired(configuration.region, 'configuration.region', String);
			assert.argumentIsRequired(configuration.prefix, 'configuration.prefix', String);
			assert.argumentIsOptional(configuration.apiVersion, 'configuration.apiVersion', String);

			this._super();

			this._sqs = null;

			this._configuration = configuration;

			this._scheduler = new Scheduler();

			this._queueUrlPromises = {};
			this._queueArnPromises = {};

			this._queueObservers = {};
			this._knownQueues = {};

			this._startPromise = null;
			this._started = false;

			this._counter = 0;
		},

		start: function() {
			var that = this;

			if (that.getIsDisposed()) {
				throw new Error('The SQS Provider has been disposed.');
			}

			if (that._started) {
				throw new Error('The AWS SQS Provider has already been started.');
			}

			if (that._startPromise === null) {
				that._startPromsie = when.try(function() {
					aws.config.update({region: that._configuration.region});

					that._sqs = new aws.SQS({apiVersion: that._configuration.apiVersion || '2012-11-05'});
				}).then(function() {
					logger.info('SQS provider started');

					that._started = true;

					return that._started;
				}).catch(function(e) {
					logger.error('SQS provider failed to start', e);

					throw e;
				});
			}

			return that._startPromise;
		},

		getQueueUrl: function(queueName) {
			assert.argumentIsRequired(queueName, 'queueName', String);

			var that = this;

			if (that.getIsDisposed()) {
				throw new Error('The SQS Provider has been disposed.');
			}

			if (!that._started) {
				throw new Error('The SQS Provider has not been started.');
			}

			var qualifiedQueueName = getQualifiedQueueName(that._configuration.prefix, queueName);

			if (!_.has(that._queueUrlPromises, qualifiedQueueName)) {
				logger.debug('The SQS Provider has not cached the queue URL. Issuing request to create queue.');

				that._queueUrlPromises[qualifiedQueueName] = that.createQueue(queueName);
			}

			return that._queueUrlPromises[qualifiedQueueName];
		},

		getQueueArn: function(queueName) {
			assert.argumentIsRequired(queueName, 'queueName', String);

			var that = this;

			if (that.getIsDisposed()) {
				throw new Error('The SQS Provider has been disposed.');
			}

			if (!that._started) {
				throw new Error('The SQS Provider has not been started.');
			}

			var qualifiedQueueName = getQualifiedQueueName(that._configuration.prefix, queueName);

			if (!_.has(that._queueArnPromises, qualifiedQueueName)) {
				that._queueArnPromises[qualifiedQueueName] = that.getQueueUrl(queueName)
					.then(function(queueUrl) {
						return when.promise(
							function(resolveCallback, rejectCallback) {
								logger.debug('Getting SQS Queue attributes:', qualifiedQueueName);

								that._sqs.getQueueAttributes({
									QueueUrl: queueUrl,
									AttributeNames: ['QueueArn']
								}, function(error, data) {
									if (error === null) {
										logger.info('SQS Queue attribute lookup complete:', qualifiedQueueName);

										resolveCallback(data.Attributes.QueueArn);
									} else {
										logger.error('SQS queue attribute lookup failed:', qualifiedQueueName);
										logger.error(error);

										rejectCallback('Failed to lookup ARN for SQS queue.');
									}
								});
							}
						);
					});
			}

			return that._queueArnPromises[qualifiedQueueName];
		},

		createQueue: function(queueName, retentionTime) {
			assert.argumentIsRequired(queueName, 'queueName', String);
			assert.argumentIsOptional(retentionTime, 'retentionTime', Number);

			var that = this;

			if (that.getIsDisposed()) {
				throw new Error('The SQS Provider has been disposed.');
			}

			if (!that._started) {
				throw new Error('The SQS Provider has not been started.');
			}

			var qualifiedQueueName = getQualifiedQueueName(that._configuration.prefix, queueName);

			return when.promise(
				function(resolveCallback, rejectCallback) {
					logger.debug('Creating SQS queue:', qualifiedQueueName);

					var retentionTimeToUse;

					if (_.isNumber(retentionTime)) {
						retentionTimeToUse = retentionTime;
					} else {
						retentionTimeToUse = 120;
					}

					that._sqs.createQueue({
						QueueName: qualifiedQueueName,
						Attributes: {
							MessageRetentionPeriod: retentionTimeToUse.toString()
						}
					}, function(error, data) {
						if (error === null) {
							logger.info('SQS queue created:', qualifiedQueueName);

							var queueUrl = data.QueueUrl;

							that._knownQueues[qualifiedQueueName] = queueUrl;

							resolveCallback(queueUrl);
						} else {
							logger.error('SQS queue creation failed:', qualifiedQueueName);
							logger.error(error);

							rejectCallback('Failed to create SQS queue.');
						}
					});
				}
			);
		},

		deleteQueue: function(queueName) {
			assert.argumentIsRequired(queueName, 'queueName', String);

			var that = this;

			if (that.getIsDisposed()) {
				throw new Error('The SQS Provider has been disposed.');
			}

			if (!that._started) {
				throw new Error('The SQS Provider has not been started.');
			}

			var qualifiedQueueName = getQualifiedQueueName(that._configuration.prefix, queueName);

			var deletePromise;

			if (_.has(that._knownQueues, qualifiedQueueName)) {
				deletePromise = executeQueueDelete.call(that, qualifiedQueueName, that._knownQueues[qualifiedQueueName]);
			} else {
				deletePromise = that.getQueueUrl(queueName)
					.then(function(queueUrl) {
						return executeQueueDelete.call(that, qualifiedQueueName, queueUrl);
					});
			}

			return deletePromise;
		},

		send: function(queueName, payload) {
			assert.argumentIsRequired(queueName, 'queueName', String);
			assert.argumentIsRequired(payload, 'payload', Object);

			var that = this;

			if (that.getIsDisposed()) {
				throw new Error('The SQS Provider has been disposed.');
			}

			if (!that._started) {
				throw new Error('The SQS Provider has not been started.');
			}

			return that.getQueueUrl(queueName)
				.then(function(queueUrl) {
					return when.promise(
						function(resolveCallback, rejectCallback) {
							var counter = ++that._counter;

							var qualifiedQueueName = getQualifiedQueueName(that._configuration.prefix, queueName);

							logger.debug('Sending message', counter, 'to SQS Queue:', qualifiedQueueName);
							logger.trace(payload);

							that._sqs.sendMessage({
								QueueUrl: queueUrl,
								MessageBody: JSON.stringify(payload)
							}, function(error, data) {
								if (error === null) {
									logger.info('Sent message', counter, 'to SQS Queue:', qualifiedQueueName);

									resolveCallback();
								} else {
									logger.error('SQS queue send', counter, ' failed:', qualifiedQueueName);
									logger.error(error);

									rejectCallback('Failed to send messages to SQS queue.');
								}
							});
						}
					);
				});
		},

		receive: function(queueName, waitDuration) {
			assert.argumentIsRequired(queueName, 'queueName', String);
			assert.argumentIsOptional(waitDuration, 'waitDuration', Number);

			var that = this;

			if (that.getIsDisposed()) {
				throw new Error('The SQS Provider has been disposed.');
			}

			if (!that._started) {
				throw new Error('The SQS Provider has not been started.');
			}

			var qualifiedQueueName = getQualifiedQueueName(that._configuration.prefix, queueName);

			if (_.has(that._queueObservers, qualifiedQueueName)) {
				throw new Error('The SQS queue is being observed.');
			}

			return receiveMessages.call(that, queueName, waitDuration);
		},

		observe: function(queueName, callback, pollInterval, pollDuration) {
			assert.argumentIsRequired(queueName, 'queueName', String);
			assert.argumentIsRequired(callback, 'callback', Function);
			assert.argumentIsOptional(pollInterval, 'pollInterval', Number);
			assert.argumentIsOptional(pollDuration, 'pollDuration', Number);

			var that = this;

			if (that.getIsDisposed()) {
				throw new Error('The SQS Provider has been disposed.');
			}

			if (!that._started) {
				throw new Error('The SQS Provider has not been started.');
			}

			var qualifiedQueueName = getQualifiedQueueName(that._configuration.prefix, queueName);

			if (_.has(that._queueObservers, qualifiedQueueName)) {
				throw new Error('The SQS queue is already being observed.');
			}

			logger.debug('Creating observer for SQS queue:', qualifiedQueueName);

			var disposed = false;

			that._queueObservers[qualifiedQueueName] = Disposable.fromAction(function() {
				logger.info('Disposing observer of SQS queue:', qualifiedQueueName);

				disposed = true;

				delete that._queueObservers[qualifiedQueueName];
			});

			var checkQueue = function() {
				if (disposed) {
					return;
				}

				var delay;

				receiveMessages.call(that, queueName, pollDuration)
					.then(function(messages) {
						return when.map(messages, function(message) {
							if (disposed) {
								return;
							}

							return callback(message);
						}).catch(function(error) {
							logger.error('An error occurred while processing message(s) from SQS queue:', qualifiedQueueName);
							logger.error(error);
						}).finally(function() {
							if (messages.length === 0) {
								delay = pollInterval || 2000;
							} else {
								delay = 0;
							}
						});
					}).catch(function(error) {
						logger.error('An error occurred while receiving message(s) from SQS queue:', qualifiedQueueName);
						logger.error(error);
					}).finally(function() {
						if (disposed) {
							return;
						}

						if (!_.isNumber(delay)) {
							delay = 5000;
						}

						that._scheduler.schedule(checkQueue, delay, 'Check SQS Queue (' + qualifiedQueueName + ')');
					});
			};

			checkQueue();

			return that._queueObservers[qualifiedQueueName];
		},

		setQueuePolicy: function(queueName, policy) {
			assert.argumentIsRequired(queueName, 'queueName', String);
			assert.argumentIsRequired(policy, 'policy', Object);

			var that = this;

			if (that.getIsDisposed()) {
				throw new Error('The SQS Provider has been disposed.');
			}

			if (!that._started) {
				throw new Error('The SQS Provider has not been started.');
			}

			return that.getQueueUrl(queueName)
				.then(function(queueUrl) {
					var qualifiedQueueName = getQualifiedQueueName(that._configuration.prefix, queueName);

					logger.debug('Updating SQS queue policy:', qualifiedQueueName);
					logger.trace(policy);

					return when.promise(function(resolveCallback, rejectCallback) {
						that._sqs.setQueueAttributes({
							QueueUrl: queueUrl,
							Attributes: {
								Policy: JSON.stringify(policy)
							}
						}, function(error, data) {
							if (error === null) {
								logger.info('SQS queue policy updated for:', qualifiedQueueName);

								resolveCallback();
							} else {
								logger.error('SQS queue policy update failed:', qualifiedQueueName);
								logger.error(error);

								rejectCallback('Failed to update SQS queue policy.');
							}
						});
					});
				});
		},

		_onDispose: function() {
			this._sqs = null;

			_.forEach(this._queueObservers, function(observer) {
				observer.dispose();
			});

			this._scheduler.dispose();
			this._scheduler = null;

			this._queueUrlPromises = null;
			this._queueArnPromises = null;

			this._queueObservers = null;

			logger.info('SQS provider disposed');
		},

		toString: function() {
			return '[SqsProvider]';
		}
	});

	function receiveMessages(queueName, waitTime) {
		var that = this;

		if (that.getIsDisposed()) {
			throw new Error('The SQS Provider has been disposed.');
		}

		if (!that._started) {
			throw new Error('The SQS Provider has not been started.');
		}

		var waitTimeToUse;

		if (_.isNumber(waitTime)) {
			if (waitTime === 0) {
				waitTimeToUse = 0;
			} else {
				waitTimeToUse = _.round(waitTime / 1000);
			}
		} else {
			waitTimeToUse = 10;
		}

		return that.getQueueUrl(queueName)
			.then(function(queueUrl) {
				return when.promise(
					function(resolveCallback, rejectCallback) {
						var qualifiedQueueName = getQualifiedQueueName(that._configuration.prefix, queueName);

						logger.debug('Receiving message(s) from SQS Queue:', qualifiedQueueName);

						that._sqs.receiveMessage({
							QueueUrl: queueUrl,
							WaitTimeSeconds: waitTimeToUse
						}, function(error, data) {
							if (error === null) {
								var messagesExist = _.isArray(data.Messages) && data.Messages.length !== 0;

								if (messagesExist) {
									logger.info('Received', data.Messages.length, 'message(s) from SQS Queue:', qualifiedQueueName);
									logger.trace(data.Messages);
								}

								var messages;

								try {
									messages = _.map(data.Messages || [], function(message) {
										return JSON.parse(message.Body);
									});
								} catch (parseError) {
									logger.error('Failed to parse message(s) received from SQS queue.', parseError);

									messages = null;
								} finally {
									if (messagesExist) {
										deleteMessages.call(that, qualifiedQueueName, queueUrl, data.Messages);
									}
								}

								if (messages) {
									resolveCallback(messages);
								} else {
									rejectCallback('Failed to parse message(s) received from SQS queue.');
								}
							} else {
								logger.error('SQS receive messages failed:', qualifiedQueueName);
								logger.error(error);

								rejectCallback('Failed to receive messages from SQS queue.');
							}
						});
					}
				);
			});
	}

	function deleteMessages(qualifiedQueueName, queueUrl, messages) {
		var that = this;

		var messageCount = messages.length;

		if (messageCount === 0) {
			return when.try(function() {
				return;
			});
		}

		return when.promise(
			function(resolveCallback, rejectCallback) {
				logger.debug('Deleting', messageCount, 'message(s) from SQS Queue:', qualifiedQueueName);

				that._sqs.deleteMessageBatch({
					QueueUrl: queueUrl,
					Entries: _.map(messages, function(message, index) {
						return {
							Id: index.toString(),
							ReceiptHandle: message.ReceiptHandle
						};
					})
				}, function(error, data) {
					if (error === null) {
						var deletedCount;

						if (_.isArray(data.Failed)) {
							deletedCount = messageCount - data.Failed.length;
						} else {
							deletedCount = messageCount;
						}

						logger.info('Deleted', deletedCount, 'message(s) from SQS Queue:', qualifiedQueueName);

						if (deletedCount !== messageCount) {
							logger.warn('Failed to delete', data.Failed.length, 'message(s) from SQS Queue:', qualifiedQueueName);

							rejectCallback('Failed to delete some messages from SQS queue.');
						} else {
							resolveCallback();
						}
					} else {
						logger.error('SQS message delete failed:', qualifiedQueueName);
						logger.error(error);

						rejectCallback('Failed to delete messages from SQS queue.');
					}
				});
			}
		);
	}

	function executeQueueDelete(qualifiedQueueName, queueUrl) {
		var that = this;

		return when.promise(
			function(resolveCallback, rejectCallback) {
				logger.debug('Deleting SQS Queue:', qualifiedQueueName);

				that._sqs.deleteQueue({
					QueueUrl: queueUrl
				}, function(error, data) {
					if (error === null) {
						logger.info('SQS Queue deleted:', qualifiedQueueName);

						resolveCallback();
					} else {
						logger.error('SQS queue delete failed:', qualifiedQueueName);
						logger.error(error);

						rejectCallback('Failed to delete SQS queue.');
					}
				});
			}
		);
	}

	SqsProvider.getPolicyForSnsDelivery = function(queueArn, topicArn) {
		var currentDate = new Date();

		return {
			Version: "2008-10-17",
			Id: queueArn + "/SQSDefaultPolicy",
			Statement: [{
				Sid: "Sid" + currentDate.getTime(),
				Effect: "Allow",
				Principal: {
					AWS: "*"
				},
				Action: "SQS:SendMessage",
				Resource: queueArn,
				Condition: {
					ArnEquals: {
						"aws:SourceArn": topicArn
					}
				}
			}]
		};
	};

	function getQualifiedQueueName(prefix, queueName) {
		return prefix + '-' + queueName;
	}

	return SqsProvider;
}();