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
			return Promise.resolve()
				.then(() => {
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
				recipientAddressesToUse = [recipientAddress];
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

					this._sesv2.sendEmail(params, (error, data) => {
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
		 * Fetches a list of suppressed email addresses.
		 *
		 * @public
		 * @async
		 * @returns {Promise}
		 */
		async getSuppressedEmails() {
			checkReady.call(this);

			let allSuppressedEmails = [];
			let nextToken = null;

			while (true) {
				const params = {};
				if (nextToken) {
					params.NextToken = nextToken;
				}

				const data = await this._sesv2.listSuppressedDestinations(params).promise();
				allSuppressedEmails = allSuppressedEmails.concat(data.SuppressedDestinationSummaries.map(item => item.EmailAddress));
				nextToken = data.NextToken || null;

				if (!nextToken) {
					break;
				}
			}

			return allSuppressedEmails;
		}

		/**
		 * Fetches a suppressed email address.
		 *
		 * @param email - The email address to fetch the data for.
		 * @returns {Promise}
		 */
		async getSuppressedDestination(email) {
			checkReady.call(this);
			const params = {
				EmailAddress: email
			};

			try {
				return await this._sesv2.getSuppressedDestination(params).promise();
			} catch (error) {
				logger.error(`Failed to get suppressed destination for ${email}`, error);
				throw error;
			}
		}

		/**
		 * Adds an email address to the suppression list.
		 *
		 * @public
		 * @async
		 * @param {string} email - The email address to suppress.
		 * @param {string=} reason - The reason for suppression (valid values: "BOUNCE", "COMPLAINT"). Defaults to "COMPLAINT".
		 * @returns {Promise<void>}
		 */
		async addEmailToSuppressionList(email, reason = 'COMPLAINT') {
			checkReady.call(this);

			assert.argumentIsRequired(email, 'email', String);

			const normalizedReason = reason.toUpperCase();
			assert.argumentIsValid(normalizedReason, 'reason', value => value === 'BOUNCE' || value === 'COMPLAINT', 'BOUNCE or COMPLAINT');

			const params = {
				EmailAddress: email,
				Reason: normalizedReason
			};

			try {
				await this._sesv2.putSuppressedDestination(params).promise();
				logger.info(`Email ${email} added to the suppression list`);
			} catch (error) {
				logger.error(`Failed to add ${email} to suppression list`, error);
				throw error;
			}
		}

		/**
		 * Returns the number of suppressed email addresses.
		 *
		 * @public
		 * @async
		 * @returns {Promise<number>}
		 */
		async getNumberOfSuppressedEmails() {
			return this.getSuppressedEmails().then(result => {
				return result.length;
			}).catch(error => {
				logger.error('Failed to get the number of suppressed emails', error);
				throw error;
			});
		}

		/**
		 * Removes an email address from the suppression list.
		 *
		 * @public
		 * @async
		 * @param {string} email - The email address to remove from the suppression list.
		 * @returns {Promise}
		 */
		async removeEmailFromSuppressionList(email) {
			checkReady.call(this);

			assert.argumentIsRequired(email, 'email', String);

			return this._sesv2.deleteSuppressedDestination({ EmailAddress: email }).promise()
				.then(() => {
					logger.info(`Email ${email} removed from the suppression list`);
				})
				.catch(error => {
					logger.error(`Failed to remove ${email} from suppression list`, error);
					throw error;
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
			throw new Error('The SES provider has been disposed.');
		}

		if (!this._started) {
			throw new Error('The SES provider has not been started.');
		}
	}

	return SesProvider;
})();