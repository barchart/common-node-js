var _ = require('lodash');
var aws = require('aws-sdk');
var when = require('when');
var log4js = require('log4js');

var assert = require('common/lang/assert');
var Disposable = require('common/lang/Disposable');
var Scheduler = require('common/timing/Scheduler');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('common-node/messaging/SqsProvider');

	var SqsProvider = Disposable.extend({
		init: function() {
			this._sqs = null;
			this._scheduler = new Scheduler();

			this._queueUrlPromises = { };
			this._queueArnPromises =  { };

			this._queueObservers = { };

			this._started = false;

			this._counter = 0;
		},

		start: function(configuration) {
			assert.argumentIsRequired(configuration, 'configuration');
			assert.argumentIsRequired(configuration.region, 'configuration.region', String);
			assert.argumentIsOptional(configuration.apiVersion, 'configuration.apiVersion', String);

			var that = this;

			if (that.getIsDisposed()) {
				throw new Error('The SQS Provider has been disposed.');
			}

			if (that._started) {
				throw new Error('The AWS SQS Provider has already been started.');
			}

			that._started = true;

			return when.try(function() {
				aws.config.update({ region: configuration.region });

				that._sqs = new aws.SQS({ apiVersion: configuration.apiVersion || '2012-11-05' });
			}).then(function() {
				logger.debug('SQS provider started');

				return that._started;
			}).catch(function(e) {
				logger.error('SQS provider failed to start', e);

				throw e;
			});
		},

		getQueueUrl: function(queueName) {
			assert.argumentIsRequired(queueName, 'queueName', String);

			if (this.getIsDisposed()) {
				throw new Error('The SQS Provider has been disposed.');
			}

			if (!this._started) {
				throw new Error('The SQS Provider has not been started.');
			}

			var that = this;

			if (!_.has(that._queueUrlPromises, queueName)) {
				that._queueUrlPromises[queueName] = when.promise(
					function(resolveCallback, rejectCallback) {
						logger.trace('Creating SQS queue:', queueName);

						that._sqs.createQueue({
							QueueName: queueName
						}, function(error, data) {
							if (error === null) {
								logger.trace('SQS queue created:', queueName);

								resolveCallback(data.QueueUrl);
							} else {
								logger.error('SQS queue creation failed:', queueName);
								logger.error(error);

								rejectCallback('Failed to create SQS queue.');
							}
						});
					}
				);
			}

			return that._queueUrlPromises[queueName];
		},

		getQueueArn: function(queueName) {
			assert.argumentIsRequired(queueName, 'queueName', String);

			if (this.getIsDisposed()) {
				throw new Error('The SQS Provider has been disposed.');
			}

			if (!this._started) {
				throw new Error('The SQS Provider has not been started.');
			}

			var that = this;

			if (!_.has(that._queueArnPromises, queueName)) {
				that._queueArnPromises[queueName] = that.getQueueUrl(queueName)
					.then(function(queueUrl) {
						return when.promise(
							function(resolveCallback, rejectCallback) {
								logger.trace('Getting SQS Queue attributes:', queueName);

								that._sqs.getQueueAttributes({
									QueueUrl: queueUrl,
									AttributeNames: [ 'QueueArn' ]
								}, function(error, data) {
									if (error === null) {
										logger.debug('SQS Queue attribute lookup complete:', queueName);

										resolveCallback(data.Attributes.QueueArn);
									} else {
										logger.error('SQS queue attribute lookup failed:', queueName);
										logger.error(error);

										rejectCallback('Failed to lookup ARN for SQS queue.');
									}
								});
							}
						);
					});
			}

			return that._queueArnPromises[queueName];
		},

		createQueue: function(queueName) {
			assert.argumentIsRequired(queueName, 'queueName', String);

			var that = this;

			if (that.getIsDisposed()) {
				throw new Error('The SQS Provider has been disposed.');
			}

			if (!that._started) {
				throw new Error('The SQS Provider has not been started.');
			}

			return that.getQueueUrl(queueName)
				.then(function(ignored) {
					return;
				});
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

			return that.getQueueUrl(queueName)
				.then(function(queueUrl) {
					return when.promise(
						function(resolveCallback, rejectCallback) {
							logger.trace('Deleting SQS Queue:', queueName);

							that._sqs.deleteQueue({
								QueueUrl: queueUrl
							}, function(error, data) {
								if (error === null) {
									logger.debug('SQS Queue deleted:', queueName);

									resolveCallback();
								} else {
									logger.error('SQS queue delete failed:', queueName);
									logger.error(error);

									rejectCallback('Failed to delete SQS queue.');
								}
							});
						}
					);
				});
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

							logger.trace('Sending message', counter,'to SQS Queue:', queueName, '\n\r', payload);

							that._sqs.sendMessage({
								QueueUrl: queueUrl,
								MessageBody: JSON.stringify(payload)
							}, function(error, data) {
								if (error === null) {
									logger.debug('Sent message', counter,'to SQS Queue:', queueName);

									resolveCallback();
								} else {
									logger.error('SQS queue send', counter,' failed:', queueName);
									logger.error(error);

									rejectCallback('Failed to send messages to SQS queue.');
								}
							});
						}
					);
				});
		},

		receive: function(queueName) {
			assert.argumentIsRequired(queueName, 'queueName', String);

			var that = this;

			if (that.getIsDisposed()) {
				throw new Error('The SQS Provider has been disposed.');
			}

			if (!that._started) {
				throw new Error('The SQS Provider has not been started.');
			}

			if (_.has(that._queueObservers, queueName)) {
				throw new Error('The SQS queue is being observed.');
			}

			return receiveMessages.call(that, queueName);
		},

		observe: function(queueName, callback, interval) {
			assert.argumentIsRequired(queueName, 'queueName', String);
			assert.argumentIsRequired(callback, 'callback', Function);
			assert.argumentIsOptional(interval, 'interval', Number);

			var that = this;

			if (that.getIsDisposed()) {
				throw new Error('The SQS Provider has been disposed.');
			}

			if (!that._started) {
				throw new Error('The SQS Provider has not been started.');
			}

			if (_.has(that._queueObservers, queueName)) {
				throw new Error('The SQS queue is already being observed.');
			}

			logger.debug('Creating observer for SQS queue:', queueName);

			var disposed = false;

			that._queueObservers[queueName] = Disposable.fromAction(function() {
				logger.debug('Disposing observer of SQS queue:', queueName);

				disposed = true;

				delete that._queueObservers[queueName];
			});

			var checkQueue = function() {
				if (disposed) {
					return;
				}

				receiveMessages.call(that, queueName)
					.then(function(messages) {
						return when.map(messages, function(message) {
							if (disposed) {
								return;
							}

							return callback(message);
						}).then(function(ignored) {
							if (disposed) {
								return;
							}

							var delay;

							if (messages.length === 0) {
								delay = interval || 2000;
							} else {
								delay = 0;
							}

							that._scheduler.schedule(checkQueue, delay, 'Check SQS Queue (' + queueName + ')');
						});
					});
			};

			checkQueue();

			return that._queueObservers[queueName];
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

			logger.debug(this, 'disposed');
		},

		toString: function() {
			return '[SqsProvider]';
		}
	});

	function receiveMessages(queueName) {
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
						logger.trace('Receiving message(s) from SQS Queue:', queueName);

						that._sqs.receiveMessage({
							QueueUrl: queueUrl
						}, function(error, data) {
							if (error === null) {
								var messagesExist = _.isArray(data.Messages) && data.Messages.length !== 0;

								if (messagesExist) {
									logger.debug('Received', data.Messages.length, 'message(s) from SQS Queue:', queueName);
								}

								var messages;

								try {
									messages = _.map(data.Messages || [ ], function(message) {
										return JSON.parse(message.Body);
									});
								} catch(parseError) {
									logger.error('Failed to parse message(s) received from SQS queue.', parseError);

									messages = null;
								} finally {
									if (messagesExist) {
										deleteMessages.call(that, queueName, queueUrl, data.Messages);
									}
								}

								if (messages) {
									resolveCallback(messages);
								} else {
									rejectCallback('Failed to parse message(s) received from SQS queue.');
								}
							} else {
								logger.error('SQS receieve messages failed:', queueName);
								logger.error(error);

								rejectCallback('Failed to receive messages from SQS queue.');
							}
						});
					}
				);
			});
	}
	
	function deleteMessages(queueName, queueUrl, messages) {
		var that = this;

		var messageCount = messages.length;

		if (messageCount === 0) {
			return when.try(function() {
				return;
			});
		}

		return when.promise(
			function(resolveCallback, rejectCallback) {
				logger.trace('Deleting', messageCount, 'message(s) from SQS Queue:', queueName);

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

						logger.debug('Deleted', deletedCount, 'message(s) from SQS Queue:', queueName);

						if (deletedCount !== messageCount) {
							logger.warn('Failed to delete', data.Failed.length, 'message(s) from SQS Queue:', queueName);

							rejectCallback('Failed to delete some messages from SQS queue.');
						} else {
							resolveCallback();
						}
					} else {
						logger.error('SQS message delete failed:', queueName);
						logger.error(error);

						rejectCallback('Failed to delete messages from SQS queue.');
					}
				});
			}
		);
	}

	return SqsProvider;
}();