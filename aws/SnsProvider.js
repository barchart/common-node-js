var aws = require('aws-sdk');
var log4js = require('log4js');

var assert = require('common/lang/assert');
var Disposable = require('common/lang/Disposable');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/aws/SnsProvider');

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

		start() {
			if (this.getIsDisposed()) {
				throw new Error('The SNS Provider has been disposed.');
			}

			if (this._startPromise === null) {
				this._startPromise = Promise.resolve()
					.then(() => {
						aws.config.update({region: this._configuration.region});

						this._sns = new aws.SNS({apiVersion: this._configuration.apiVersion || '2010-03-31'});
					}).then(() => {
						logger.info('SNS provider started');

						this._started = true;

						return this._started;
					}).catch((e) => {
						logger.error('SNS provider failed to start', e);

						throw e;
					});
			}

			return this._startPromise;
		}

		getTopicArn(topicName) {
			assert.argumentIsRequired(topicName, 'topicName', String);

			if (this.getIsDisposed()) {
				throw new Error('The SNS Provider has been disposed.');
			}

			if (!this._started) {
				throw new Error('The SNS Provider has not been started.');
			}

			const qualifiedTopicName = getQualifiedTopicName(this._configuration.prefix, topicName);

			if (!this._topicPromises.hasOwnProperty(qualifiedTopicName)) {
				logger.debug('The SNS Provider has not cached the topic ARN. Issuing request to create topic.');

				this._topicPromises[qualifiedTopicName] = this.createTopic(topicName);
			}

			return this._topicPromises[qualifiedTopicName];
		}

		createTopic(topicName) {
			assert.argumentIsRequired(topicName, 'topicName', String);

			if (this.getIsDisposed()) {
				throw new Error('The SNS Provider has been disposed.');
			}

			if (!this._started) {
				throw new Error('The SNS Provider has not been started.');
			}

			return new Promise(
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
		}

		deleteTopic(topicName) {
			assert.argumentIsRequired(topicName, 'topicName', String);

			if (this.getIsDisposed()) {
				throw new Error('The SNS Provider has been disposed.');
			}

			if (!this._started) {
				throw new Error('The SNS Provider has not been started.');
			}

			return this.getTopicArn(topicName)
				.then((topicArn) => {
					const qualifiedTopicName = getQualifiedTopicName(this._configuration.prefix, topicName);

					return new Promise(
						(resolveCallback, rejectCallback) => {
							logger.debug('Deleting SNS topic:', qualifiedTopicName);

							this._sns.deleteTopic({
								TopicArn: topicArn
							}, (error, data) => {
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
		}

		publish(topicName, payload) {
			assert.argumentIsRequired(topicName, 'topicName', String);
			assert.argumentIsRequired(payload, 'payload', Object);

			if (this.getIsDisposed()) {
				throw new Error('The SNS Provider has been disposed.');
			}

			if (!this._started) {
				throw new Error('The SNS Provider has not been started.');
			}

			return this.getTopicArn(topicName)
				.then((topicArn) => {
					const qualifiedTopicName = getQualifiedTopicName(this._configuration.prefix, topicName);

					return new Promise(
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
		}

		subscribe(topicName, queueArn) {
			assert.argumentIsRequired(topicName, 'topicName', String);
			assert.argumentIsRequired(queueArn, 'queueArn', String);

			if (this.getIsDisposed()) {
				throw new Error('The SNS Provider has been disposed.');
			}

			if (!this._started) {
				throw new Error('The SNS Provider has not been started.');
			}

			const qualifiedTopicName = getQualifiedTopicName(this._configuration.prefix, topicName);

			if (!this._subscriptionPromises.hasOwnProperty(qualifiedTopicName)) {
				this._subscriptionPromises[qualifiedTopicName] = this.getTopicArn(topicName)
					.then((topicArn) => {
						return new Promise(
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
		}

		_onDispose() {
			this._topicPromises = null;
			this._subscriptionPromises = null;

			logger.debug('SNS provider disposed');
		}

		toString() {
			return '[SnsProvider]';
		}
	}

	function getQualifiedTopicName(prefix, topicName) {
		return sanitizedName(prefix + '-' + topicName);
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

	const finalStarRegex = new RegExp('(\\*)$');
	const finalHatRegex = new RegExp('(\\^)$');
	const finalDotRegex = new RegExp('(\\.)$');
	const finalDollarRegex = new RegExp('(\\$)$');

	return SnsProvider;
})();
