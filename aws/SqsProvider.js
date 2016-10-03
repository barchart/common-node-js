var aws = require('aws-sdk');
var log4js = require('log4js');

var assert = require('common/lang/assert');
var Disposable = require('common/lang/Disposable');
var is = require('common/lang/is');
var Scheduler = require('common/timing/Scheduler');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/aws/SqsProvider');

	class SqsProvider extends Disposable {
		constructor(configuration) {
			super();

			assert.argumentIsRequired(configuration, 'configuration');
			assert.argumentIsRequired(configuration.region, 'configuration.region', String);
			assert.argumentIsRequired(configuration.prefix, 'configuration.prefix', String);
			assert.argumentIsOptional(configuration.apiVersion, 'configuration.apiVersion', String);

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
		}

		start() {
			if (this.getIsDisposed()) {
				throw new Error('The SQS Provider has been disposed.');
			}

			if (this._started) {
				throw new Error('The AWS SQS Provider has already been started.');
			}

			if (this._startPromise === null) {
				this._startPromise = Promise.resolve()
					.then(() => {
						aws.config.update({region: this._configuration.region});

						this._sqs = new aws.SQS({apiVersion: this._configuration.apiVersion || '2012-11-05'});
					}).then(() => {
						logger.info('SQS Provider started');

						this._started = true;

						return this._started;
					}).catch((e) => {
						logger.error('SQS Provider failed to start', e);

						throw e;
					});
			}

			return this._startPromise;
		}

		getQueueUrl(queueName) {
			assert.argumentIsRequired(queueName, 'queueName', String);

			if (this.getIsDisposed()) {
				throw new Error('The SQS Provider has been disposed.');
			}

			if (!this._started) {
				throw new Error('The SQS Provider has not been started.');
			}

			const qualifiedQueueName = getQualifiedQueueName(this._configuration.prefix, queueName);

			if (!this._queueUrlPromises.hasOwnProperty(qualifiedQueueName)) {
				logger.debug('The SQS Provider has not cached the queue URL. Issuing request to create queue.');

				this._queueUrlPromises[qualifiedQueueName] = this.createQueue(queueName);
			}

			return this._queueUrlPromises[qualifiedQueueName];
		}

		getQueueArn(queueName) {
			assert.argumentIsRequired(queueName, 'queueName', String);

			if (this.getIsDisposed()) {
				throw new Error('The SQS Provider has been disposed.');
			}

			if (!this._started) {
				throw new Error('The SQS Provider has not been started.');
			}

			const qualifiedQueueName = getQualifiedQueueName(this._configuration.prefix, queueName);

			if (!this._queueArnPromises.hasOwnProperty(qualifiedQueueName)) {
				this._queueArnPromises[qualifiedQueueName] = this.getQueueUrl(queueName)
					.then((queueUrl) => {
						return new Promise(
							(resolveCallback, rejectCallback) => {
								logger.debug('Getting SQS queue attributes:', qualifiedQueueName);

								this._sqs.getQueueAttributes({
									QueueUrl: queueUrl,
									AttributeNames: ['QueueArn']
								}, (error, data) => {
									if (error === null) {
										logger.info('SQS queue attribute lookup complete:', qualifiedQueueName);

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

			return this._queueArnPromises[qualifiedQueueName];
		}

		createQueue(queueName, retentionTime) {
			assert.argumentIsRequired(queueName, 'queueName', String);
			assert.argumentIsOptional(retentionTime, 'retentionTime', Number);

			if (this.getIsDisposed()) {
				throw new Error('The SQS Provider has been disposed.');
			}

			if (!this._started) {
				throw new Error('The SQS Provider has not been started.');
			}

			const qualifiedQueueName = getQualifiedQueueName(this._configuration.prefix, queueName);

			return new Promise(
				(resolveCallback, rejectCallback) => {
					logger.debug('Creating SQS queue:', qualifiedQueueName);

					let retentionTimeToUse;

					if (is.number(retentionTime)) {
						retentionTimeToUse = retentionTime;
					} else {
						retentionTimeToUse = 120;
					}

					this._sqs.createQueue({
						QueueName: qualifiedQueueName,
						Attributes: {
							MessageRetentionPeriod: retentionTimeToUse.toString()
						}
					}, (error, data) => {
						if (error === null) {
							logger.info('SQS queue created:', qualifiedQueueName);

							const queueUrl = data.QueueUrl;

							this._knownQueues[qualifiedQueueName] = queueUrl;

							resolveCallback(queueUrl);
						} else {
							logger.error('SQS queue creation failed:', qualifiedQueueName);
							logger.error(error);

							rejectCallback('Failed to create SQS queue.');
						}
					});
				}
			);
		}

		deleteQueue(queueName) {
			assert.argumentIsRequired(queueName, 'queueName', String);

			if (this.getIsDisposed()) {
				throw new Error('The SQS Provider has been disposed.');
			}

			if (!this._started) {
				throw new Error('The SQS Provider has not been started.');
			}

			const qualifiedQueueName = getQualifiedQueueName(this._configuration.prefix, queueName);

			let deletePromise;

			if (this._knownQueues.hasOwnProperty(qualifiedQueueName)) {
				deletePromise = executeQueueDelete.call(this, qualifiedQueueName, this._knownQueues[qualifiedQueueName]);
			} else {
				deletePromise = this.getQueueUrl(queueName)
					.then((queueUrl) => {
						return executeQueueDelete.call(this, qualifiedQueueName, queueUrl);
					});
			}

			return deletePromise;
		}

		send(queueName, payload) {
			assert.argumentIsRequired(queueName, 'queueName', String);
			assert.argumentIsRequired(payload, 'payload', Object);

			if (this.getIsDisposed()) {
				throw new Error('The SQS Provider has been disposed.');
			}

			if (!this._started) {
				throw new Error('The SQS Provider has not been started.');
			}

			return this.getQueueUrl(queueName)
				.then((queueUrl) => {
					return new Promise(
						(resolveCallback, rejectCallback) => {
							const counter = ++this._counter;

							const qualifiedQueueName = getQualifiedQueueName(this._configuration.prefix, queueName);

							logger.debug('Sending message', counter, 'to SQS queue:', qualifiedQueueName);
							logger.trace(payload);

							this._sqs.sendMessage({
								QueueUrl: queueUrl,
								MessageBody: JSON.stringify(payload)
							}, (error, data) => {
								if (error === null) {
									logger.info('Sent message', counter, 'to SQS queue:', qualifiedQueueName);

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
		}

		receive(queueName, waitDuration, maximumMessages) {
			assert.argumentIsRequired(queueName, 'queueName', String);
			assert.argumentIsOptional(waitDuration, 'waitDuration', Number);
			assert.argumentIsOptional(maximumMessages, 'maximumMessages', Number);

			if (this.getIsDisposed()) {
				throw new Error('The SQS Provider has been disposed.');
			}

			if (!this._started) {
				throw new Error('The SQS Provider has not been started.');
			}

			const qualifiedQueueName = getQualifiedQueueName(this._configuration.prefix, queueName);

			if (this._queueObservers.hasOwnProperty(qualifiedQueueName)) {
				throw new Error('The SQS queue is being observed.');
			}

			return receiveMessages.call(this, queueName, waitDuration, maximumMessages);
		}

		observe(queueName, callback, pollInterval, pollDuration, batchSize) {
			assert.argumentIsRequired(queueName, 'queueName', String);
			assert.argumentIsRequired(callback, 'callback', Function);
			assert.argumentIsOptional(pollInterval, 'pollInterval', Number);
			assert.argumentIsOptional(pollDuration, 'pollDuration', Number);
			assert.argumentIsOptional(batchSize, 'batchSize', Number);

			if (this.getIsDisposed()) {
				throw new Error('The SQS Provider has been disposed.');
			}

			if (!this._started) {
				throw new Error('The SQS Provider has not been started.');
			}

			const qualifiedQueueName = getQualifiedQueueName(this._configuration.prefix, queueName);

			if (this._queueObservers.hasOwnProperty(qualifiedQueueName)) {
				throw new Error('The SQS queue is already being observed.');
			}

			logger.debug('Creating observer for SQS queue:', qualifiedQueueName);

			let disposed = false;

			this._queueObservers[qualifiedQueueName] = Disposable.fromAction(() => {
				logger.info('Disposing observer of SQS queue:', qualifiedQueueName);

				disposed = true;

				delete this._queueObservers[qualifiedQueueName];
			});

			const checkQueue = () => {
				if (disposed) {
					return;
				}

				let delay;

				receiveMessages.call(this, queueName, pollDuration, batchSize)
					.then((messages) => {
						return Promise.all(messages.map((message) => {
							if (disposed) {
								return;
							}

							return callback(message);
						})).catch((error) => {
							logger.error('An error occurred while processing message(s) from SQS queue:', qualifiedQueueName);
							logger.error(error);
						}).then(() => {
							if (messages.length === 0) {
								delay = pollInterval || 2000;
							} else {
								delay = 0;
							}
						});
					}).catch((error) => {
						logger.error('An error occurred while receiving message(s) from SQS queue:', qualifiedQueueName);
						logger.error(error);
					}).then(() => {
						if (disposed) {
							return;
						}

						if (!is.number(delay)) {
							delay = 5000;
						}

						this._scheduler.schedule(checkQueue, delay, 'Check SQS queue (' + qualifiedQueueName + ')');
					});
			};

			checkQueue();

			return this._queueObservers[qualifiedQueueName];
		}

		setQueuePolicy(queueName, policy) {
			assert.argumentIsRequired(queueName, 'queueName', String);
			assert.argumentIsRequired(policy, 'policy', Object);

			if (this.getIsDisposed()) {
				throw new Error('The SQS Provider has been disposed.');
			}

			if (!this._started) {
				throw new Error('The SQS Provider has not been started.');
			}

			return this.getQueueUrl(queueName)
				.then((queueUrl) => {
					const qualifiedQueueName = getQualifiedQueueName(this._configuration.prefix, queueName);

					logger.debug('Updating SQS queue policy:', qualifiedQueueName);
					logger.trace(policy);

					return new Promise((resolveCallback, rejectCallback) => {
						this._sqs.setQueueAttributes({
							QueueUrl: queueUrl,
							Attributes: {
								Policy: JSON.stringify(policy)
							}
						}, (error, data) => {
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
		}

		_onDispose() {
			this._queueObservers.forEach((observer) => {
				observer.dispose();
			});

			this._scheduler.dispose();
			this._scheduler = null;

			this._queueUrlPromises = null;
			this._queueArnPromises = null;

			this._queueObservers = null;

			logger.info('SQS Provider disposed');
		}

		static getPolicyForSnsDelivery(queueArn, topicArn) {
			const currentDate = new Date();

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
		}

		toString() {
			return '[SqsProvider]';
		}
	}

	function receiveMessages(queueName, waitTime,maximumMessages) {
		if (this.getIsDisposed()) {
			throw new Error('The SQS Provider has been disposed.');
		}

		if (!this._started) {
			throw new Error('The SQS Provider has not been started.');
		}

		let waitTimeToUse;

		if (is.number(waitTime)) {
			if (waitTime === 0) {
				waitTimeToUse = 0;
			} else {
				waitTimeToUse = Math.round(waitTime / 1000);
			}
		} else {
			waitTimeToUse = 10;
		}

		let maximumMessagesToUse;

		if (is.number(maximumMessages)) {
			maximumMessagesToUse = Math.max(Math.min(10, maximumMessages), 1);
		} else {
			maximumMessagesToUse = 1;
		}

		return this.getQueueUrl(queueName)
			.then((queueUrl) => {
				return new Promise(
					(resolveCallback, rejectCallback) => {
						const qualifiedQueueName = getQualifiedQueueName(this._configuration.prefix, queueName);

						logger.debug('Receiving message(s) from SQS queue:', qualifiedQueueName);

						this._sqs.receiveMessage({
							QueueUrl: queueUrl,
							MaxNumberOfMessages: maximumMessagesToUse,
							WaitTimeSeconds: waitTimeToUse
						}, (error, data) => {
							if (error === null) {
								const messagesExist = is.array(data.Messages) && data.Messages.length !== 0;

								if (messagesExist) {
									logger.info('Received', data.Messages.length, 'message(s) from SQS queue:', qualifiedQueueName);
									logger.trace(data.Messages);
								} else {
									logger.debug('Received 0 message(s) from SQS queue:', qualifiedQueueName);
								}

								let messages;

								try {
									messages = (data.Messages || []).map((message) => {
										return JSON.parse(message.Body);
									});
								} catch (parseError) {
									logger.error('Failed to parse message(s) received from SQS queue.', parseError);

									messages = null;
								} finally {
									if (messagesExist) {
										deleteMessages.call(this, qualifiedQueueName, queueUrl, data.Messages);
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
		const messageCount = messages.length;

		if (messageCount === 0) {
			return Promise.resolve();
		}

		return new Promise(
			(resolveCallback, rejectCallback) => {
				logger.debug('Deleting', messageCount, 'message(s) from SQS queue:', qualifiedQueueName);

				this._sqs.deleteMessageBatch({
					QueueUrl: queueUrl,
					Entries: messages.map((message, index) => {
						return {
							Id: index.toString(),
							ReceiptHandle: message.ReceiptHandle
						};
					})
				}, (error, data) => {
					if (error === null) {
						let deletedCount;

						if (is.array(data.Failed)) {
							deletedCount = messageCount - data.Failed.length;
						} else {
							deletedCount = messageCount;
						}

						logger.info('Deleted', deletedCount, 'message(s) from SQS queue:', qualifiedQueueName);

						if (deletedCount !== messageCount) {
							logger.warn('Failed to delete', data.Failed.length, 'message(s) from SQS queue:', qualifiedQueueName);

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
		return new Promise(
			(resolveCallback, rejectCallback) => {
				logger.debug('Deleting SQS queue:', qualifiedQueueName);

				this._sqs.deleteQueue({
					QueueUrl: queueUrl
				}, (error, data) => {
					if (error === null) {
						logger.info('SQS queue deleted:', qualifiedQueueName);

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

	const finalStarRegex = new RegExp('(\\*)$');
	const finalHatRegex = new RegExp('(\\^)$');
	const finalDotRegex = new RegExp('(\\.)$');
	const finalDollarRegex = new RegExp('(\\$)$');

	function getQualifiedQueueName(prefix, queueName) {
		return sanitizedName(prefix + '-' + queueName);
	}

	function sanitizedName(messageType) {
		return messageType.replace(finalStarRegex, '_star')
			.replace(finalHatRegex, '_hat')
			.replace(finalDotRegex, '_dot')
			.replace(finalDollarRegex, '_dollar')
			.replace('*', '_star_')
			.replace('^', '_hat_')
			.replace('.', '_dot_')
			.replace('$', '_dollar_');
	}

	return SqsProvider;
})();
