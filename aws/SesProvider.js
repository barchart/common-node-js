var _ = require('lodash');
var aws = require('aws-sdk');
var when = require('when');
var log4js = require('log4js');

var assert = require('common/lang/assert');
var Disposable = require('common/lang/Disposable');
var RateLimiter = require('common/timing/RateLimiter');

var Environment = require('./../environment/Environment');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('common-node/messaging/SesProvider');

	var SesProvider = Disposable.extend({
		init: function(configuration) {
			assert.argumentIsRequired(configuration, 'configuration');
			assert.argumentIsRequired(configuration.region, 'configuration.region', String);
			assert.argumentIsOptional(configuration.apiVersion, 'configuration.apiVersion', String);

			if (_.isArray(configuration.recipientOverride)) {
				assert.argumentIsArray(configuration.recipientOverride, 'configuration.recipientOverride', String);
			} else {
				assert.argumentIsOptional(configuration.recipientOverride, 'configuration.recipientOverride', String);
			}

			assert.argumentIsOptional(configuration.rateLimitPerSecond, 'configuration.rateLimitPerSecond', Number);

			this._super();

			this._ses = null;

			this._configuration = configuration;

			this._startPromise = null;
			this._started = false;

			this._rateLimiter = new RateLimiter(configuration.rateLimitPerSecond || 10, 1000);
		},

		start: function() {
			var that = this;

			if (that.getIsDisposed()) {
				throw new Error('The SES Provider has been disposed.');
			}

			if (that._startPromise === null) {
				that._startPromise = when.try(function() {
					aws.config.update({region: that._configuration.region});

					that._ses = new aws.SES({apiVersion: that._configuration.apiVersion || '2010-12-01'});
				}).then(function() {
					logger.info('SES provider started');

					that._started = true;

					return that._started;
				}).catch(function(e) {
					logger.error('SES provider failed to start', e);

					throw e;
				});
			}

			return that._startPromise;
		},

		sendEmail: function(senderAddress, recipientAddress, subject, htmlBody, textBody) {
			assert.argumentIsRequired(senderAddress, 'senderAddress', String);

			if (_.isArray(recipientAddress)) {
				assert.argumentIsArray(recipientAddress, 'recipientAddress', String);
			} else {
				assert.argumentIsRequired(recipientAddress, 'recipientAddress', String);
			}

			assert.argumentIsOptional(subject, 'subject', String);
			assert.argumentIsOptional(htmlBody, 'htmlBody', String);
			assert.argumentIsOptional(textBody, 'textBody', String);

			var that = this;

			if (that.getIsDisposed()) {
				throw new Error('The SES Provider has been disposed.');
			}

			if (!that._started) {
				throw new Error('The SES Provider has not been started.');
			}

			if (this._configuration.recipientOverride && !Environment.getInstance().getIsProduction()) {
				logger.warn('Overriding email recipient for testing purposes.');

				recipientAddress = this._configuration.recipientOverride;
			} else {
				logger.error('no override used');
			}

			var recipientAddressesToUse;

			if (_.isArray(recipientAddress)) {
				recipientAddressesToUse = recipientAddress;
			} else {
				recipientAddressesToUse = [recipientAddress];
			}

			var recipientAddressesToUse;

			if (_.isArray(recipientAddress)) {
				recipientAddressesToUse = recipientAddress;
			} else {
				recipientAddressesToUse = [recipientAddress];
			}

			var params = {
				Destination: {
					ToAddresses: recipientAddressesToUse
				},
				Message: {
					Body: {}
				},
				Source: senderAddress
			};

			if (_.isString(subject) && subject.length > 0) {
				params.Message.Subject = {
					Data: subject
				};
			}

			if (_.isString(htmlBody) && htmlBody.length > 0) {
				params.Message.Body.Html = {
					Data: htmlBody
				};
			}

			if (_.isString(textBody) && textBody.length > 0) {
				params.Message.Body.Text = {
					Data: textBody
				};
			}

			return this._rateLimiter.enqueue(function() {
				return when.promise(function(resolveCallback, rejectCallback) {
					logger.debug('Sending email to', recipientAddress);

					that._ses.sendEmail(params, function(error, data) {
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
		},

		_onDispose: function() {
			this._rateLimiter.dispose();

			logger.debug('SES provider disposed');
		},

		toString: function() {
			return '[SesProvider]';
		}
	});

	return SesProvider;
}();