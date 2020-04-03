const log4js = require('log4js'),
	twilio = require('twilio');

const assert = require('@barchart/common-js/lang/assert'),
	is = require('@barchart/common-js/lang/is'),
	Disposable = require('@barchart/common-js/lang/Disposable'),
	RateLimiter = require('@barchart/common-js/timing/RateLimiter');

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

			this._configuration = configuration;

			this._startPromise = null;
			this._started = false;

			this._client = null;
			this._rateLimiter = null;

			this._counter = 0;
		}

		start() {
			if (this._startPromise === null) {
				this._startPromise = Promise.resolve()
					.then(() => {
						logger.info('Twilio provider started');

						this._client = twilio(this._configuration.accountSid, this._configuration.authToken);
						this._rateLimiter = new RateLimiter(this._configuration.rateLimitPerSecond || 10, 1000);

						this._started = true;

						return Promise.resolve(true);
					}).catch((e) => {
						logger.error('Twilio provider failed to start', e);

						return Promise.reject(false);
					});
			}

			return this._startPromise;
		}

		/**
		 * Sends an SMS message to one (or more) phone numbers.
		 *
		 * @public
		 * @param {String|Array<String>} recipients
		 * @param {String} content
		 * @param {String=} source
		 * @returns {Promise<String|Array<String>>}
		 */
		sendSms(recipients, content, source) {
			return Promise.resolve()
				.then(() => {
					if (is.array(recipients)) {
						assert.argumentIsArray(recipients, 'recipients', String);
					} else {
						assert.argumentIsRequired(recipients, 'recipients', String);
					}

					assert.argumentIsRequired(content, 'content', String);
					assert.argumentIsOptional(sourceNumber, 'source', String);

					checkReady.call(this);

					let recipientsToUse;
					let recipientsPlural;
					
					if (this._configuration.recipientOverride) {
						recipientsToUse = [ this._configuration.recipientOverride ];
						recipientsPlural = false;
					} else if (is.array(recipients)) {
						recipientsToUse = recipients;
						recipientsPlural = true;
					} else {
						recipientsToUse = [ recipients ];
						recipientsPlural = false;
					}
					
					let sourceToUse;

					if (source) {
						sourceToUse = source;
					} else {
						sourceToUse = this._configuration.sourceNumber;
					}

					const sendAction = () => {
						return Promise.all(recipientsToUse.map((recipient) => {
							const id = this._counter++;

							const payload = { };

							payload.from = sourceToUse;
							payload.to = recipient;
							payload.body = content;

							logger.debug('Sending SMS [', id, '] via Twilio to [', recipient, ']');

							return this._client.messages.create(payload)
								.then((response) => {
									logger.debug('Sent SMS [', id, '] via Twilio to [', recipient, '] with SID [', response.sid, ']');

									return response.sid;
								}).catch((e) => {
									logger.error('Failed to send SMS [', id, '] via Twilio to [', recipient, ']', e);

									return null;
								});
						})).then((responses) => {
							if (recipientsPlural) {
								return responses;
							} else {
								return responses[0];
							}
						});
					};

					return this._rateLimiter.enqueue(sendAction);
				});
		}

		_onDispose() {
			logger.debug('Twilio disposed');

			if (this._rateLimiter !== null) {
				this._rateLimiter.dispose();
			}

			this._rateLimiter = null;
			this._client = null;
		}

		toString() {
			return '[TwilioProvider]';
		}
	}
	
	function checkReady() {
		if (this.getIsDisposed()) {
			throw new Error('The Twilio provider has been disposed.');
		}

		if (!this._started) {
			throw new Error('The Twilio Provider has not been started.');
		}
	}

	return TwilioProvider;
})();
