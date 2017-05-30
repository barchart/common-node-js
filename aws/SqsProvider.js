const aws = require('aws-sdk'),
	log4js = require('log4js');

const array = require('common/lang/array'),
	assert = require('common/lang/assert'),
	Disposable = require('common/lang/Disposable'),
	is = require('common/lang/is'),
	object = require('common/lang/object'),
	promise = require('common/lang/promise'),
	Scheduler = require('common/timing/Scheduler');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/aws/SqsProvider');

	/**
	 * A facade for Amazon's Simple Queue Service (SQS). The constructor
	 * accepts configuration options. The promise-based instance functions
	 * abstract knowledge of the AWS API.
	 *
	 * @public
	 * @extends Disposable
	 * @param {object} configuration
	 * @param {string} configuration.region - The AWS region (e.g. "us-east-1").
	 * @param {string} configuration.prefix - The prefix that is prepended to any queue name.
	 * @param {string=} configuration.apiVersion - The SES version (defaults to "2012-11-05").
	 */
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
			this._retentionTimes = {};

			this._startPromise = null;
			this._started = false;

			this._counter = 0;
		}

		/**
		 * Initializes the Amazon SDK. Call this before invoking any other instance
		 * functions.
		 *
		 * @public
		 * @returns {Promise.<Boolean>}
		 */
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

		/**
		 * Returns a clone of the configuration object originally passed
		 * to the constructor.
		 *
		 * @returns {Object}
		 */
		getConfiguration() {
			if (this.getIsDisposed()) {
				throw new Error('The SQS Provider has been disposed.');
			}

			return object.clone(this._configuration);
		}

		/**
		 * Returns a list of queue URL's where the queue names start with a
		 * given prefix.
		 *
		 * @param {string} queueNamePrefix - The prefix a queue name must have to be returned.
		 * @returns {Promise.<string[]>}
		 */
		getQueues(queueNamePrefix) {
			assert.argumentIsOptional(queueNamePrefix, 'queueNamePrefix', String);

			return promise.build((resolveCallback, rejectCallback) => {
				let queuePrefixToUse = this._configuration.prefix;

				if (queueNamePrefix) {
					queuePrefixToUse = queuePrefixToUse + queueNamePrefix;
				}

				logger.info('Listing SQS queues with name prefix', queuePrefixToUse);

				this._sqs.listQueues({ QueueNamePrefix: queuePrefixToUse }, (error, data) => {
					if (error === null) {
						const queueUrls = data.QueueUrls || [ ];

						logger.debug('Listing of', queueUrls.length, 'SQS queues with name prefix', queuePrefixToUse, 'complete');

						resolveCallback(queueUrls);
					} else {
						logger.error('Listing of SQS queues with name prefix', queuePrefixToUse, 'failed');
						logger.error(error);

						rejectCallback('Failed to list SQS queues.');
					}
				});
			});
		}

		/**
		 * Given a queue's name, return the queue's URL. If no queue with the given
		 * name exists, it will be created.
		 *
		 * @param {string} queueName - The name of the queue to find.
		 * @returns {Promise.<string>}
		 */
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

		/**
		 * Given a queue's name, return Amazon's unique identifier for the queue
		 * (i.e. the ARN). If no queue with the given name exists, it will be created.
		 *
		 * @param {string} queueName - The name of the queue to find.
		 * @returns {Promise.<string>}
		 */
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
						return promise.build(
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

		/**
		 * Creates a queue having the given name (and other options) and returns
		 * the queue's URL. If the queue already exists, the URL of the existing
		 * queue is returned.
		 *
		 * @param {string} queueName - The name of the queue to create.
		 * @param {Number=} retentionTime - The length of time a queue will retain a message in seconds.
		 * @returns {Promise.<string>}
		 */
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

			return promise.build(
				(resolveCallback, rejectCallback) => {
					logger.debug('Creating SQS queue:', qualifiedQueueName);

					const payload = {
						QueueName: qualifiedQueueName,
					};

					if (is.number(retentionTime)) {
						payload.Attributes = {
							MessageRetentionPeriod: retentionTime.toString()
						};
					}

					this._sqs.createQueue(payload, (error, data) => {
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

		/**
		 * Deletes a queue having the given name.
		 *
		 * @param {string} queueName - The name of the queue to delete.
		 *
		 * @returns {Promise}
		 */
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

		/**
		 * Deletes a queue having the given URL.
		 *
		 * @param {string} queueUrl - The URL of the queue to delete.
		 *
		 * @returns {Promise}
		 */
		deleteQueueUrl(queueUrl) {
			assert.argumentIsRequired(queueUrl, 'queueUrl', String);

			return executeQueueDelete.call(this, 'unspecified', queueUrl);
		}

		/**
		 * Enqueues a message in the queue. If the queue doesn't exist, it will
		 * be created.
		 *
		 * @param {string} queueName - The name of the queue to add the message to.
		 * @param {Object} payload - The message to enqueue (will be serialized to JSON).
		 *
		 * @returns {Promise}
		 */
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
					return promise.build(
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

		/**
		 * Reads from the queue and deletes any messages that are read. After
		 * the operation, the queue will not necessarily be empty.
		 *
		 * @param {string} queueName - The name of the queue to read.
		 * @param {Number=} waitDuration - The maximum amount of time the server-side long-poll will wait for messages to become available.
		 * @param {Number=} maximumMessages - The maximum number of messages to read (cannot be more than 10).
		 *
		 * @returns {Promise.<Object[]>}
		 */
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

		/**
		 * Reads all messages from queue (perhaps requiring multiple calls to the
		 * AWS SDK) and returns an array of messages (use with caution).
		 *
		 * @param {string} queueName - The name of the queue to read.
		 * @param {Function=} mapper - A function that can be used to map messages into something else.
		 *
		 * @returns {Promise.<Object[]>}
		 */
		drain(queueName, mapper) {
			assert.argumentIsRequired(queueName, 'queueName', String);
			assert.argumentIsOptional(mapper, 'mapper', Function);

			const batches = [ ];
			const batchSize = 10;

			const mapperToUse = mapper || (m => m);

			const executeDrain = () => {
				return this.receive(queueName, 0, batchSize)
					.then((messages) => {
						batches.push(messages.map(mapper));

						if (messages.length < batchSize) {
							return batches;
						} else {
							return executeDrain();
						}
					});
			};

			return executeDrain()
				.then(() => {
					return array.flatten(batches);
				});
		}

		/**
		 * Makes repeated reads from a queue until canceled and returns messages
		 * using the callback provided.
		 *
		 * @param {string} queueName - The name of the queue to read.
		 * @param {Function} callback - Invoked with a messages as they become available.
		 * @param {Number=} pollInterval - The milliseconds to wait between polling the queue.
		 * @param {Number=} pollDuration - The maximum amount of time the server-side long-poll will wait for messages to become available.
		 * @param {Number=} maximumMessages - The maximum number of messages to read per request (cannot be more than 10).
		 *
		 * @returns {Promise}
		 */
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

		/**
		 * Changes the policy on a Queue. The "policy" must conform to Amazon's schema.
		 *
		 * @param {string} queueName - The name of the queue to adjust.
		 * @param {Object} policy - The Amazon schema-compliant policy.
		 * @returns {Promise}
		 */
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

					return promise.build((resolveCallback, rejectCallback) => {
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
			Object.keys(this._queueObservers).forEach((key) => {
				this._queueObservers[key].dispose();
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

	function receiveMessages(queueName, waitTime, maximumMessages) {
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
			waitTimeToUse = 20;
		}

		let maximumMessagesToUse;

		if (is.number(maximumMessages)) {
			maximumMessagesToUse = Math.max(Math.min(10, maximumMessages), 1);
		} else {
			maximumMessagesToUse = 1;
		}

		return this.getQueueUrl(queueName)
			.then((queueUrl) => {
				return promise.build(
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

		return promise.build(
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
		return promise.build(
			(resolveCallback, rejectCallback) => {
				logger.debug('Deleting SQS queue:', qualifiedQueueName, 'at URL', queueUrl);

				this._sqs.deleteQueue({
					QueueUrl: queueUrl
				}, (error, data) => {
					if (error === null) {
						logger.info('SQS queue deleted:', qualifiedQueueName, 'at URL', queueUrl);

						resolveCallback();
					} else {
						logger.error('SQS queue delete failed:', qualifiedQueueName, 'at URL', queueUrl);
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

	const starRegex = new RegExp('\\*', 'g');
	const hatRegex = new RegExp('\\^', 'g');
	const dotRegex = new RegExp('\\*', 'g');
	const dollarRegex = new RegExp('\\*', 'g');

	function getQualifiedQueueName(prefix, queueName) {
		return sanitizedName(prefix + '-' + queueName);
	}

	function sanitizedName(messageType) {
		return messageType.replace(finalStarRegex, '_star')
			.replace(finalHatRegex, '_hat')
			.replace(finalDotRegex, '_dot')
			.replace(finalDollarRegex, '_dollar')
			.replace(starRegex, '_star_')
			.replace(hatRegex, '_hat_')
			.replace(dotRegex, '_dot_')
			.replace(dollarRegex, '_dollar_');
	}

	return SqsProvider;
})();
