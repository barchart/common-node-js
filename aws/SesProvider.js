const aws = require('aws-sdk'),
	log4js = require('log4js'),
	nodemailer = require('nodemailer');

const assert = require('@barchart/common-js/lang/assert'),
	Disposable = require('@barchart/common-js/lang/Disposable'),
	is = require('@barchart/common-js/lang/is'),
	object = require('@barchart/common-js/lang/object'),
	promise = require('@barchart/common-js/lang/promise'),
	RateLimiter = require('@barchart/common-js/timing/RateLimiter');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/aws/SesProvider');

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

			this._configuration = configuration;

			this._ses = null;
			this._transport = null;

			this._startPromise = null;
			this._started = false;

			this._rateLimiter = new RateLimiter(configuration.rateLimitPerSecond || 10, 1000);
		}

		/**
		 * Initializes the Amazon SDK. Call this before invoking any other instance
		 * functions.
		 *
		 * @public
		 * @returns {Promise<Boolean>}
		 */
		start() {
			if (this.getIsDisposed()) {
				return Promise.reject('Unable to start, the SesProvider has been disposed.');
			}

			if (this._startPromise === null) {
				this._startPromise = Promise.resolve()
					.then(() => {
						aws.config.update({region: this._configuration.region});

						this._transport = nodemailer.createTransport({
							SES: new aws.SES({
								apiVersion: '2010-12-01'
							})
						});

						this._ses = new aws.SES({apiVersion: this._configuration.apiVersion || '2010-12-01'});
					}).then(() => {
						logger.info('The SesProvider has started');

						this._started = true;

						return this._started;
					}).catch((e) => {
						logger.error('The SesProvider failed to start', e);

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
				throw new Error('The SesProvider has been disposed.');
			}

			return object.clone(this._configuration);
		}

		send(options) {
			return Promise.resolve()
				.then(() => {
					assert.argumentIsRequired(options.senderAddress, 'senderAddress', String);
					assert.argumentIsRequired(options.recipientAddress, 'recipientAddress', String);
					assert.argumentIsRequired(options.subject, 'subject', String);
					assert.argumentIsRequired(options.recipientAddress, 'senderAddress', String);

					assert.argumentIsOptional(options.headers, 'headers', Object);
				}).then(() => {
					return this._rateLimiter.enqueue(() => {
						return promise.build((resolve, reject) => {
							logger.debug('Sending email to [', options.recipientAddress, ']');

							this._transport.sendMail({
								from: options.senderAddress,
								to: options.recipientAddress,
								subject: options.subject,
								html: options.htmlBody,
								text: options.textBody,
								headers: options.headers
							}, (error, result) => {
								if (error) {
									logger.error('SES Email Provider failed to send email message', options);
									logger.error(error);

									reject(error);
								} else {
									logger.debug('Sent email to [', options.recipientAddress, ']');

									resolve(result);
								}
							});
						});
					});
				});
		}

		/**
		 * Attempts to send an email.
		 *
		 * @param {string} senderAddress - The "from" email address.
		 * @param {string|string[]} recipientAddress - The "to" email address(es).
		 * @param {string=} subject - The email's subject.
		 * @param {string=} htmlBody - The email's body.
		 * @param {string=} textBody - The email's body.
		 * @returns {Promise}
		 */
		sendEmail(senderAddress, recipientAddress, subject, htmlBody, textBody) {
			return Promise.resolve()
				.then(() => {
					assert.argumentIsRequired(senderAddress, 'senderAddress', String);

					checkReady.call(this);

					if (is.array(recipientAddress)) {
						assert.argumentIsArray(recipientAddress, 'recipientAddress', String);
					} else {
						assert.argumentIsRequired(recipientAddress, 'recipientAddress', String);
					}

					assert.argumentIsOptional(subject, 'subject', String);
					assert.argumentIsOptional(htmlBody, 'htmlBody', String);
					assert.argumentIsOptional(textBody, 'textBody', String);

					if (this.getIsDisposed()) {
						throw new Error('The SesProvider has been disposed');
					}

					if (!this._started) {
						throw new Error('The SesProvider has not been started');
					}

					if (this._configuration.recipientOverride) {
						logger.warn('Overriding email recipient for testing purposes, using [', this._configuration.recipientOverride, ']');

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

					return this._rateLimiter.enqueue(() => {
						return promise.build((resolveCallback, rejectCallback) => {
							logger.debug('Sending email to [', recipientAddress, ']');

							this._ses.sendEmail(params, (error, data) => {
								if (error) {
									logger.error('SES Email Provider failed to send email message', params);
									logger.error(error);

									rejectCallback(error);
								} else {
									logger.debug('Sent email to [', recipientAddress, ']');

									resolveCallback();
								}
							});
						});
					});
				});
		}

		_onDispose() {
			this._rateLimiter.dispose();
		}

		toString() {
			return '[SesProvider]';
		}
	}

	function checkReady() {
		if (this.getIsDisposed()) {
			throw new Error('The SesProvider has been disposed.');
		}

		if (!this._started) {
			throw new Error('The SesProvider has not been started.');
		}
	}

	return SesProvider;
})();