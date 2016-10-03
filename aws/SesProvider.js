var aws = require('aws-sdk');
var log4js = require('log4js');

var assert = require('common/lang/assert');
var Disposable = require('common/lang/Disposable');
var is = require('common/lang/is');
var RateLimiter = require('common/timing/RateLimiter');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/messaging/SesProvider');

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

		sendEmail(senderAddress, recipientAddress, subject, htmlBody, textBody) {
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

			return this._rateLimiter.enqueue(() => {
				return new Promise((resolveCallback, rejectCallback) => {
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