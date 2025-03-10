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

			this._sesv2 = null;
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
		 * @async
		 * @returns {Promise<Boolean>}
		 */
		async start() {
			if (this.getIsDisposed()) {
				return Promise.reject('Unable to start, the SES provider has been disposed.');
			}

			if (this._startPromise === null) {
				this._startPromise = Promise.resolve()
					.then(() => {
						aws.config.update({region: this._configuration.region});

						this._transport = nodemailer.createTransport({
							SES: new aws.SESV2({
								apiVersion: '2019-09-27'
							})
						});

						this._sesv2 = new aws.SESV2({ apiVersion: this._configuration.apiVersion || '2019-09-27' });
					}).then(() => {
						logger.info('The SES provider has started');

						this._started = true;

						return this._started;
					}).catch((e) => {
						logger.error('The SES provider failed to start', e);

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
				throw new Error('The SES provider has been disposed.');
			}

			return object.clone(this._configuration);
		}

		async send(options) {
			assert.argumentIsRequired(options.senderAddress, 'senderAddress', String);
			assert.argumentIsRequired(options.recipientAddress, 'recipientAddress', String);
			assert.argumentIsRequired(options.subject, 'subject', String);
			assert.argumentIsRequired(options.recipientAddress, 'senderAddress', String);

			assert.argumentIsOptional(options.headers, 'headers', Object);

			checkReady.call(this);

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
							logger.error('SES provider failed to send email message', options);
							logger.error(error);

							reject(error);
						} else {
							logger.debug('Sent email to [', options.recipientAddress, ']');

							resolve(result);
						}
					});
				});
			});
		}

		/**
		 * Attempts to send an email.
		 *
		 * @public
		 * @async
		 * @param {string} senderAddress - The "from" email address.
		 * @param {string|string[]} recipientAddress - The "to" email address(es).
		 * @param {string=} subject - The email's subject.
		 * @param {string=} htmlBody - The email's HTML body.
		 * @param {string=} textBody - The email's text body.
		 * @returns {Promise}
		 */
		async sendEmail(senderAddress, recipientAddress, subject, htmlBody, textBody) {
			assert.argumentIsRequired(senderAddress, 'senderAddress', String);

			if (is.array(recipientAddress)) {
				assert.argumentIsArray(recipientAddress, 'recipientAddress', String);
			} else {
				assert.argumentIsRequired(recipientAddress, 'recipientAddress', String);
			}

			assert.argumentIsOptional(subject, 'subject', String);
			assert.argumentIsOptional(htmlBody, 'htmlBody', String);
			assert.argumentIsOptional(textBody, 'textBody', String);

			checkReady.call(this);

			if (this._configuration.recipientOverride) {
				logger.warn('Overriding email recipient for testing purposes, using [', this._configuration.recipientOverride, ']');

				recipientAddress = this._configuration.recipientOverride;
			}

			let recipientAddressesToUse;

			if (is.array(recipientAddress)) {
				recipientAddressesToUse = recipientAddress;
			} else {
				recipientAddressesToUse = [ recipientAddress ];
			}

			const params = {
				Destination: {
					ToAddresses: recipientAddressesToUse
				},
				Content: {
					Simple: {
						Subject: { Data: subject || '' },
						Body: {}
					}
				},
				FromEmailAddress: senderAddress
			};

			if (is.string(htmlBody) && htmlBody.length > 0) {
				params.Content.Simple.Body.Html = { Data: htmlBody };
			}

			if (is.string(textBody) && textBody.length > 0) {
				params.Content.Simple.Body.Text = { Data: textBody };
			}

			return this._rateLimiter.enqueue(() => {
				return promise.build((resolveCallback, rejectCallback) => {
					logger.debug('Sending email to [', recipientAddress, ']');

					this._sesv2.sendEmail(params, (error) => {
						if (error) {
							logger.error('SES provider failed to send email message', params);
							logger.error(error);
							rejectCallback(error);
						} else {
							logger.debug('Sent email to [', recipientAddress, ']');
							resolveCallback();
						}
					});
				});
			});
		}

		/**
		 * Returns a specific item on the account-level suppression list.
		 *
		 * @public
		 * @async
		 * @param {string} email
		 * @returns {Promise<Object|null>}
		 */
		async getSuppressedItem(email) {
			checkReady.call(this);

			assert.argumentIsRequired(email, 'email', String);

			let item;

			try {
				const response = await this._sesv2.getSuppressedDestination({ EmailAddress: email }).promise();

				item = transformSuppressionListItem(response.SuppressedDestination);
			} catch (e) {
				if (e && e.code === 'NotFoundException') {
					item = null;
				} else {
					throw e;
				}
			}

			return item;
		}

		/**
		 * Returns the list of items on the account-level suppression list.
		 *
		 * @public
		 * @async
		 * @returns {Promise}
		 */
		async getSuppressedItems() {
			checkReady.call(this);

			const items = [];

			let token = null;

			while (true) {
				const params = {};

				if (token) {
					params.NextToken = token;
				}

				const response = await this._sesv2.listSuppressedDestinations(params).promise();
				const batch = response.SuppressedDestinationSummaries;

				for (let i = 0; i < batch.length; i++) {
					items.push(transformSuppressionListItem(batch[i]));
				}

				token = batch.NextToken || null;

				if (token === null) {
					break;
				}
			}

			return items;
		}

		/**
		 * Adds an email address to the suppression list.
		 *
		 * @public
		 * @async
		 * @param {string} email - The email address to suppress.
		 * @param {string=} reason - The reason for suppression (valid values: "BOUNCE", "COMPLAINT"). Defaults to "COMPLAINT".
		 * @returns {Promise}
		 */
		async addSuppressedItem(email, reason = 'COMPLAINT') {
			checkReady.call(this);

			assert.argumentIsRequired(email, 'email', String);
			assert.argumentIsOptional(reason, 'reason', String);

			assert.argumentIsValid(reason, 'reason', r => r.toUpperCase() === 'BOUNCE' || r.toUpperCase() === 'COMPLAINT', 'must be one of [ BOUNCE, COMPLIANT ]');

			await this._sesv2.putSuppressedDestination({ EmailAddress: email, Reason: reason.toUpperCase() }).promise();
		}

		/**
		 * Removes an email address from the suppression list.
		 *
		 * @public
		 * @async
		 * @param {string} email - The email address to remove from the suppression list.
		 * @returns {Promise}
		 */
		async removeSuppressedItem(email) {
			checkReady.call(this);

			assert.argumentIsRequired(email, 'email', String);

			await this._sesv2.deleteSuppressedDestination({ EmailAddress: email }).promise();
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
			throw new Error('The SES provider has been disposed.');
		}

		if (!this._started) {
			throw new Error('The SES provider has not been started.');
		}
	}

	function transformSuppressionListItem(data) {
		const email = data.EmailAddress;
		const reason = data.Reason;
		const date = data.LastUpdateTime;

		return { email, reason, date };
	}

	return SesProvider;
})();