const aws = require('aws-sdk'),
	log4js = require('log4js');

const assert = require('common/lang/assert'),
	Disposable = require('common/lang/Disposable'),
	object = require('common/lang/object'),
	promise = require('common/lang/promise');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/aws/SnsProvider');

	/**
	 * A facade for Amazon's Notification Service (SNS). The constructor
	 * accepts configuration options. The promise-based instance functions
	 * abstract knowledge of the AWS API.
	 *
	 * @public
	 * @extends Disposable
	 * @param {object} configuration
	 * @param {string} configuration.region - The AWS region (e.g. "us-east-1").
	 * @param {string} configuration.prefix - The prefix that is prepended to any topic name.
	 * @param {string=} configuration.apiVersion - The SES version (defaults to "2010-03-31").
	 */
	class SnsProvider extends Disposable {
		constructor(configuration) {
			super();

			assert.argumentIsRequired(configuration, 'configuration');
			assert.argumentIsRequired(configuration.region, 'configuration.region', String);
			assert.argumentIsRequired(configuration.prefix, 'configuration.prefix', String);
			assert.argumentIsOptional(configuration.apiVersion, 'configuration.apiVersion', String);

			this._sns = null;

			this._configuration = configuration;

			this._startPromise = null;
			this._started = false;

			this._topicPromises = {};
			this._subscriptionPromises = {};
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
				return Promise.reject('The SNS Provider has been disposed.');
			}

			if (this._startPromise === null) {
				this._startPromise = Promise.resolve()
					.then(() => {
						aws.config.update({region: this._configuration.region});

						this._sns = new aws.SNS({apiVersion: this._configuration.apiVersion || '2010-03-31'});
					}).then(() => {
						logger.info('SNS Provider started');

						this._started = true;

						return this._started;
					}).catch((e) => {
						logger.error('SNS Provider failed to start', e);

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
				throw new Error('The SNS Provider has been disposed.');
			}

			return object.clone(this._configuration);
		}

		/**
		 * Given a topic's name, return Amazon's unique identifier for the topic
		 * (i.e. the ARN). If no topc with the given name exists, it will be created.
		 *
		 * @param {string} topicName - The name of the topic to find.
		 * @returns {Promise.<string>}
		 */
		getTopicArn(topicName) {
			return Promise.resolve(() => {
				assert.argumentIsRequired(topicName, 'topicName', String);

				checkReady.call(this);

				const qualifiedTopicName = getQualifiedTopicName(this._configuration.prefix, topicName);

				if (!this._topicPromises.hasOwnProperty(qualifiedTopicName)) {
					logger.debug('The SNS Provider has not cached the topic ARN. Issuing request to create topic.');

					this._topicPromises[qualifiedTopicName] = this.createTopic(topicName);
				}

				return this._topicPromises[qualifiedTopicName];
			});
		}

		/**
		 * Creates a topic with the given name  and returns the topic's ARN. If the topic already
		 * exists, the ARN of the existing topic is returned.
		 *
		 * @param {string} topicName - The name of the topic to create.
		 * @returns {Promise.<string>}
		 */
		createTopic(topicName) {
			return Promise.resolve(() => {
				assert.argumentIsRequired(topicName, 'topicName', String);

				checkReady.call(this);

				return promise.build(
					(resolveCallback, rejectCallback) => {
						const qualifiedTopicName = getQualifiedTopicName(this._configuration.prefix, topicName);

						logger.debug('Creating SNS topic:', qualifiedTopicName);

						this._sns.createTopic({
							Name: qualifiedTopicName
						}, (error, data) => {
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
			});
		}

		/**
		 * Deletes a topic having the given name.
		 *
		 * @param {string} topicName - The name of the topic to delete.
		 *
		 * @returns {Promise}
		 */
		deleteTopic(topicName) {
			return Promise.resolve(() => {
				assert.argumentIsRequired(topicName, 'topicName', String);

				checkReady.call(this);

				return this.getTopicArn(topicName)
					.then((topicArn) => {
						const qualifiedTopicName = getQualifiedTopicName(this._configuration.prefix, topicName);

						logger.info('Deleting SNS topic:', qualifiedTopicName, ' at topic ARN:', topicArn);

						return this.deleteTopicArn(topicArn);
					});
			});
		}

		/**
		 * Deletes a tiouc having the given URL.
		 *
		 * @param {string} topicArn - The ARN the topic to delete.
		 *
		 * @returns {Promise}
		 */
		deleteTopicArn(topicArn) {
			return Promise.resolve(() => {
				assert.argumentIsRequired(topicArn, 'topicArn', String);

				checkReady.call(this);

				return promise.build(
					(resolveCallback, rejectCallback) => {
						logger.debug('Deleting SNS topic at ARN:', topicArn);

						this._sns.deleteTopic({
							TopicArn: topicArn
						}, (error, data) => {
							if (error === null) {
								logger.info('SNS topic deleted at ARN:', topicArn);

								resolveCallback();
							} else {
								logger.error('SNS topic deletion failed at ARN:', topicArn);
								logger.error(error);

								rejectCallback('Failed to delete SNS topic.');
							}
						});
					}
				);
			});
		}

		/**
		 * Publishes a message to a topic. The message will be serialized as JSON.
		 *
		 * @param {string} topicName - The name of the topic to publish to.
		 * @param {Object} payload - The message to publish (which will be serialized as JSON).
		 *
		 * @returns {Promise}
		 */
		publish(topicName, payload) {
			return Promise.resolve(() => {
				assert.argumentIsRequired(topicName, 'topicName', String);
				assert.argumentIsRequired(payload, 'payload', Object);

				checkReady.call(this);

				return this.getTopicArn(topicName)
					.then((topicArn) => {
						const qualifiedTopicName = getQualifiedTopicName(this._configuration.prefix, topicName);

						return promise.build(
							(resolveCallback, rejectCallback) => {
								logger.debug('Publishing to SNS topic:', qualifiedTopicName);
								logger.trace(payload);

								this._sns.publish({
									TopicArn: topicArn,
									Message: JSON.stringify(payload)
								}, (error, data) => {
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
			});
		}

		/**
		 * Subscribes an SQS queue to an SNS topic. Once the subscription
		 * has been established the queue can be monitored (see
		 * {@link SqsProvider#receive} or {@link SqsProvider#observe}).
		 *
		 * The promise will return a Disposable instance. Call the
		 * dispose method to delete the subscription.
		 *
		 * @param {string} topicName - The name of the topic to subscribe to.
		 * @param {Object} queueArn - The ARN of the queue to receive notifications (see {@link SqsProvider#getQueueArn}).
		 *
		 * @returns {Promise.<Disposable>}
		 */
		subscribe(topicName, queueArn) {
			return Promise.resolve(() => {
				assert.argumentIsRequired(topicName, 'topicName', String);
				assert.argumentIsRequired(queueArn, 'queueArn', String);

				checkReady.call(this);

				const qualifiedTopicName = getQualifiedTopicName(this._configuration.prefix, topicName);

				if (!this._subscriptionPromises.hasOwnProperty(qualifiedTopicName)) {
					this._subscriptionPromises[qualifiedTopicName] = this.getTopicArn(topicName)
						.then((topicArn) => {
							return promise.build(
								(resolveCallback, rejectCallback) => {
									logger.debug('Subscribing SQS queue to SNS topic:', qualifiedTopicName);

									this._sns.subscribe({
										'TopicArn': topicArn,
										'Endpoint': queueArn,
										'Protocol': 'sqs'
									}, (error, data) => {
										if (error === null) {
											logger.info('SNS subscription to SQS topic complete:', qualifiedTopicName);

											resolveCallback(Disposable.fromAction(() => {
												if (this.getIsDisposed()) {
													return;
												}

												logger.debug('Unsubscribing SQS queue from SNS topic:', qualifiedTopicName);

												delete this._subscriptionPromises[qualifiedTopicName];

												this._sns.unsubscribe({
													SubscriptionArn: data.SubscriptionArn
												}, (error, data) => {
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

				return this._subscriptionPromises[qualifiedTopicName];
			});
		}

		/**
		 * Returns a list of topic ARN's that match a given prefix.
		 *
		 * @param {string} topicNamePrefix - The prefix a topic name must have to be returned.
		 * @returns {Promise.<string[]>}
		 */
		getTopics(topicNamePrefix) {
			return Promise.resolve(() => {
				assert.argumentIsOptional(topicNamePrefix, 'topicNamePrefix', String);

				checkReady.call(this);

				const getTopicBatch = (token) => {
					return promise.build(
						(resolveCallback, rejectCallback) => {
							logger.debug('Requesting batch of SNS topics');

							const params = { };

							if (token) {
								params.NextToken = token;
							}

							this._sns.listTopics(params, (error, data) => {
								if (error === null) {
									logger.info('SNS topic list batch received.');

									if (data.NextToken) {
										logger.debug('Another batch of SNS topics is available.');
									} else {
										logger.info('Batch of SNS topics is final, no more topics exist.');
									}

									resolveCallback(data);
								} else {
									logger.error('SNS topic list lookup failed');
									logger.error(error);

									rejectCallback('Failed to retrieve list of SNS topics.');
								}
							});
						}
					);
				};

				return promise.build((resolveCallback, rejectCallback) => {
					let topics = [ ];

					let topicArnRegex = new RegExp(`^arn:aws:sns:.*:[0-9]*:${this._configuration.prefix}${(topicNamePrefix || '')}`);

					const processBatch = (data) => {
						let batchPromise;

						if (data.Topics) {
							data.Topics.forEach(topic => {
								if (topicArnRegex.test(topic.TopicArn)) {
									topics.push(topic.TopicArn);
								}
							});

							logger.debug('Received', topics.length, 'SNS topics.');
						}

						if (data.NextToken) {
							batchPromise = getTopicBatch(data.NextToken)
								.then((data) => {
									return processBatch(data);
								});
						} else {
							batchPromise = resolveCallback(topics);
						}

						return batchPromise;
					};

					getTopicBatch()
						.then((data) => {
							return processBatch(data)
								.then((topics) => {
									resolveCallback(topics);
								});
						});
				});
			});
		}

		_onDispose() {
			this._topicPromises = null;
			this._subscriptionPromises = null;

			logger.debug('SNS Provider disposed');
		}

		toString() {
			return '[SnsProvider]';
		}
	}

	function checkReady() {
		if (this.getIsDisposed()) {
			throw new Error('The Dynamo Provider has been disposed.');
		}

		if (!this._started) {
			throw new Error('The Dynamo Provider has not been started.');
		}
	}

	function getQualifiedTopicName(prefix, topicName) {
		return sanitizedName(prefix + '-' + topicName);
	}

	const finalStarRegex = new RegExp('(\\*)$');
	const finalHatRegex = new RegExp('(\\^)$');
	const finalDotRegex = new RegExp('(\\.)$');
	const finalDollarRegex = new RegExp('(\\$)$');

	const starRegex = new RegExp('\\*', 'g');
	const hatRegex = new RegExp('\\^', 'g');
	const dotRegex = new RegExp('\\*', 'g');
	const dollarRegex = new RegExp('\\*', 'g');

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

	return SnsProvider;
})();
