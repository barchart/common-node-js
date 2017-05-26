const aws = require('aws-sdk'),
	log4js = require('log4js');

const assert = require('common/lang/assert'),
	Disposable = require('common/lang/Disposable'),
	is = require('common/lang/is'),
	object = require('common/lang/object'),
	promise = require('common/lang/promise'),
	RateLimiter = require('common/timing/RateLimiter');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/messaging/SesProvider');

	/**
	 * A facade for Amazon's Simple Email Service (SES). The constructor
	 * accepts configuration options. The promise-based instance functions
	 * abstract knowledge of the AWS API.
	 *
	 * @public
	 * @extends Disposable
	 * @param {object} configuration
	 * @param {string} configuration.region - The AWS region (e.g. "us-east-1").
	 * @param {string=} configuration.apiVersion - The SES version (defaults to "2010-12-01").
	 * @param {string=} configuration.recipientOverride - If specified, all emails sent will be redirected to this email address, ignoring the specified recipient.
	 * @param {string=} configuration.rateLimitPerSecond - The number of emails which will be sent to the AWS SDK within one second (defaults to 10).
	 */
	class SesProvider extends Disposable {
		constructor(configuration) {
			super();

			assert.argumentIsRequired(configuration, 'configuration');
			assert.argumentIsRequired(configuration.region, 'configuration.region', String);
			assert.argumentIsOptional(configuration.apiVersion, 'configuration.apiVersion', String);

			if (is.array(configuration.recipientOverride)) {
				assert.argumentIsArray(configuration.recipientOverride, 'configuration.recipientOverride', String);
			} else {
				assert.argumentIsOptional(configuration.recipientOverride, 'configuration.recipientOverride', String);
			}

			assert.argumentIsOptional(configuration.rateLimitPerSecond, 'configuration.rateLimitPerSecond', Number);

			this._ses = null;

			this._configuration = configuration;

			this._startPromise = null;
			this._started = false;

			this._rateLimiter = new RateLimiter(configuration.rateLimitPerSecond || 10, 1000);
		}

		/**
		 * Initializes the Amazon SDK. Call this before inoking any other instance
		 * functions.
		 *
		 * @public
		 * @returns {Promise.<Boolean>}
		 */
		start() {
			if (this.getIsDisposed()) {
				throw new Error('The SES Provider has been disposed.');
			}

			if (this._startPromise === null) {
				this._startPromise = Promise.resolve()
					.then(() => {
						aws.config.update({region: this._configuration.region});

						this._ses = new aws.SES({apiVersion: this._configuration.apiVersion || '2010-12-01'});
					}).then(() => {
						logger.info('SES Provider started');

						this._started = true;

						return this._started;
					}).catch((e) => {
						logger.error('SES Provider failed to start', e);

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
				throw new Error('The SES Provider has been disposed.');
			}

			return object.clone(this._configuration);
		}

		/**
		 * Attempts to send an email.
		 *
		 * @param {string} senderAddress - The "from" email address.
		 * @param {string} recipientAddress - The "to" email address.
		 * @param {string=} subject - The email's subject.
		 * @param {string=} htmlBody - The email's body.
		 * @param {string=} textBody - The email's body.
		 * @param {Object[]|undefined} tags - A set of key-value pairs to add to the emails header.
		 * @param {string} tags[].name - The name of the tag.
		 * @param {string} tags[].value - The value of the tag.
		 * @returns {Promise}
		 */
		sendEmail(senderAddress, recipientAddress, subject, htmlBody, textBody, tags) {
			if (this.getIsDisposed()) {
				throw new Error('The SES Provider has been disposed.');
			}

			if (!this._started) {
				throw new Error('The SES Provider has not been started.');
			}

			assert.argumentIsRequired(senderAddress, 'senderAddress', String);

			if (is.array(recipientAddress)) {
				assert.argumentIsArray(recipientAddress, 'recipientAddress', String);
			} else {
				assert.argumentIsRequired(recipientAddress, 'recipientAddress', String);
			}

			assert.argumentIsOptional(subject, 'subject', String);
			assert.argumentIsOptional(htmlBody, 'htmlBody', String);
			assert.argumentIsOptional(textBody, 'textBody', String);

			if (this.getIsDisposed()) {
				throw new Error('The SES Provider has been disposed.');
			}

			if (!this._started) {
				throw new Error('The SES Provider has not been started.');
			}

			if (this._configuration.recipientOverride) {
				logger.warn('Overriding email recipient for testing purposes.');

				recipientAddress = this._configuration.recipientOverride;
			}

			let recipientAddressesToUse;

			if (is.array(recipientAddress)) {
				recipientAddressesToUse = recipientAddress;
			} else {
				recipientAddressesToUse = [recipientAddress];
			}

			const params = {
				Destination: {
					ToAddresses: recipientAddressesToUse
				},
				Message: {
					Body: {}
				},
				Source: senderAddress
			};

			if (is.string(subject) && subject.length > 0) {
				params.Message.Subject = {
					Data: subject
				};
			}

			if (is.string(htmlBody) && htmlBody.length > 0) {
				params.Message.Body.Html = {
					Data: htmlBody
				};
			}

			if (is.string(textBody) && textBody.length > 0) {
				params.Message.Body.Text = {
					Data: textBody
				};
			}

			if (is.array(tags)) {
				const keys = object.keys(tags);

				params.Tags = keys.reduce((accumulator, tag) => {
					if (is.string(tag.name) && is.string(tag.value)) {
						accumulator.push({Name: tag.name, Value: tag.value});
					}

					return accumulator;
				}, [ ]);
			}

			return this._rateLimiter.enqueue(() => {
				return promise.build((resolveCallback, rejectCallback) => {
					logger.debug('Sending email to', recipientAddress);

					this._ses.sendEmail(params, (error, data) => {
						if (error) {
							logger.error('SES Email Provider failed to send email message', params);
							logger.error(error);

							rejectCallback(error);
						} else {
							logger.debug('Sent email to', recipientAddress);

							resolveCallback();
						}
					});
				});
			});
		}

		_onDispose() {
			this._rateLimiter.dispose();

			logger.debug('SES Provider disposed');
		}

		toString() {
			return '[SesProvider]';
		}
	}

	return SesProvider;
})();