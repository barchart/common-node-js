var log4js = require('log4js');
var twilio = require('twilio');

var assert = require('common/lang/assert');
var is = require('common/lang/is');
var Disposable = require('common/lang/Disposable');
var RateLimiter = require('common/timing/RateLimiter');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/sms/TwilioProvider');

	class TwilioProvider extends Disposable {
		constructor(configuration) {
			super();

			assert.argumentIsRequired(configuration, 'configuration');
			assert.argumentIsRequired(configuration.accountSid, 'configuration.accountSid', String);
			assert.argumentIsRequired(configuration.authToken, 'configuration.authToken', String);
			assert.argumentIsRequired(configuration.sourceNumber, 'configuration.sourceNumber', String);

			if (is.array(configuration.recipientOverride)) {
				assert.argumentIsArray(configuration.recipientOverride, 'configuration.recipientOverride', String);
			} else {
				assert.argumentIsOptional(configuration.recipientOverride, 'configuration.recipientOverride', String);
			}

			assert.argumentIsOptional(configuration.rateLimitPerSecond, 'configuration.rateLimitPerSecond', Number);

			this._publisher = null;

			this._configuration = configuration;

			this._startPromise = null;
			this._started = false;

			this._rateLimiter = new RateLimiter(configuration.rateLimitPerSecond || 10, 1000);
		}

		start() {
			if (this.getIsDisposed()) {
				throw new Error('The Twilio provider has been disposed.');
			}

			if (this._startPromise === null) {
				this._startPromise = Promise.resolve()
					.then(() => {
						this._publisher = twilio(this._configuration.accountSid, this._configuration.authToken);
					}).then(() => {
						logger.info('Twilio provider started');

						this._started = true;

						return this._started;
					}).catch((e) => {
						logger.error('Twilio provider failed to start', e);

						throw e;
					});
			}

			return this._startPromise;
		}

		sendSms(recipientNumber, content, sourceNumber) {
			if (is.array(recipientNumber)) {
				assert.argumentIsArray(recipientNumber, 'recipientNumber', String);
			} else {
				assert.argumentIsRequired(recipientNumber, 'recipientNumber', String);
			}

			assert.argumentIsRequired(content, 'content', String);
			assert.argumentIsOptional(sourceNumber, 'sourceNumber', String);

			if (this.getIsDisposed()) {
				throw new Error('The Twilio provider has been disposed.');
			}

			if (!this._started) {
				throw new Error('The Twilio provider has not been started.');
			}

			if (this._configuration.recipientOverride) {
				logger.warn('Overriding sms recipient for testing purposes.');

				recipientNumber = this._configuration.recipientOverride;
			}

			let recipientNumbersToUse;

			if (is.array(recipientNumber)) {
				recipientNumbersToUse = recipientNumber;
			} else {
				recipientNumbersToUse = [recipientNumber];
			}

			const sourceNumberToUse = sourceNumber || this._configuration.sourceNumber;

			return this._rateLimiter.enqueue(() => {
				return new Promise((resolveCallback, rejectCallback) => {
					recipientNumbersToUse.forEach((targetNumber) => {
						logger.debug('Sending sms via twilio to', targetNumber);

						return this._publisher.sendMessage({ from: sourceNumberToUse, to: targetNumber, body: content }, () => {
							resolveCallback();
						});
					});
				});
			});
		}

		_onDispose() {
			this._rateLimiter.dispose();

			logger.debug('Twilio provider disposed');
		}

		toString() {
			return '[TwilioProvider]';
		}
	}

	return TwilioProvider;
})();