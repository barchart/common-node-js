var _ = require('lodash');
var when = require('when');
var log4js = require('log4js');
var twilio = require('twilio');

var assert = require('common/lang/assert');
var Disposable = require('common/lang/Disposable');
var RateLimiter = require('common/timing/RateLimiter');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('common-node/sms/TwilioProvider');

	var TwilioProvider = Disposable.extend({
		init: function(configuration) {
			assert.argumentIsRequired(configuration, 'configuration');
			assert.argumentIsRequired(configuration.accountSid, 'configuration.accountSid', String);
			assert.argumentIsRequired(configuration.authToken, 'configuration.authToken', String);
			assert.argumentIsRequired(configuration.sourceNumber, 'configuration.sourceNumber', String);

			if (_.isArray(configuration.recipientOverride)) {
				assert.argumentIsArray(configuration.recipientOverride, 'configuration.recipientOverride', String);
			} else {
				assert.argumentIsOptional(configuration.recipientOverride, 'configuration.recipientOverride', String);
			}

			assert.argumentIsOptional(configuration.rateLimitPerSecond, 'configuration.rateLimitPerSecond', Number);

			this._super();

			this._publisher = null;

			this._configuration = configuration;

			this._startPromise = null;
			this._started = false;

			this._rateLimiter = new RateLimiter(configuration.rateLimitPerSecond || 10, 1000);
		},

		start: function() {
			var that = this;

			if (that.getIsDisposed()) {
				throw new Error('The Twilio provider has been disposed.');
			}

			if (that._startPromise === null) {
				that._startPromise = when.try(function() {
					that._publisher = twilio(that._configuration.accountSid, that._configuration.authToken);
				}).then(function() {
					logger.info('Twilio provider started');

					that._started = true;

					return that._started;
				}).catch(function(e) {
					logger.error('Twilio provider failed to start', e);

					throw e;
				});
			}

			return that._startPromise;
		},

		sendSms: function(recipientNumber, content, sourceNumber) {
			if (_.isArray(recipientNumber)) {
				assert.argumentIsArray(recipientNumber, 'recipientNumber', String);
			} else {
				assert.argumentIsRequired(recipientNumber, 'recipientNumber', String);
			}

			assert.argumentIsRequired(content, 'content', String);
			assert.argumentIsOptional(sourceNumber, 'sourceNumber', String);

			var that = this;

			if (that.getIsDisposed()) {
				throw new Error('The Twilio provider has been disposed.');
			}

			if (!that._started) {
				throw new Error('The Twilio provider has not been started.');
			}

			if (this._configuration.recipientOverride) {
				logger.warn('Overriding sms recipient for testing purposes.');

				recipientNumber = this._configuration.recipientOverride;
			}

			var recipientNumbersToUse;

			if (_.isArray(recipientAddress)) {
				recipientNumbersToUse = recipientAddress;
			} else {
				recipientNumbersToUse = [recipientAddress];
			}

			var sourceNumberToUse = sourceNumber || that._configuration.sourceNumber;

			return this._rateLimiter.enqueue(function() {
				return when.promise(function(resolveCallback, rejectCallback) {
					recipientNumbersToUse.forEach(function(targetNumber) {
						logger.debug('Sending sms via twilio to', targetNumber);

						return that._publisher.sendMessage({ from: sourceNumberToUse, to: targetNumber, body: content }, function() {
							resolveCallback();
						});
					});
				});
			});
		},

		_onDispose: function() {
			this._rateLimiter.dispose();

			logger.debug('Twilio provider disposed');
		},

		toString: function() {
			return '[TwilioProvider]';
		}
	});

	return TwilioProvider;
}();