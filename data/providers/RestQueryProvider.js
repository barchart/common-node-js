var _ = require('lodash');
var digest = require('http-digest-client');
var http = require('http');
var https = require('https');
var log4js = require('log4js');
var when = require('when');

var QueryProvider = require('./../QueryProvider');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('data/providers/RestQueryProvider');

	var counter = 0;

	var RestQueryProvider = QueryProvider.extend({
		init: function(configuration) {
			this._super(configuration);
		},

		_runQuery: function(criteria) {
			var that = this;

			return when.promise(function(resolveCallback, rejectCallback) {
				var secure = that._getConfiguration().protocol === 'https';

				var requestOptions = that._getRequestOptions(criteria);
				var authenticationOptions = that._getAuthenticationOptions(criteria);

				var queryId = ++counter;

				logger.debug('Executing HTTP query', queryId);
				logger.trace(requestOptions);

				var handleResponse = function(response) {
					response.setEncoding('utf8');

					var responseText = '';

					response.on('error', function(error) {
						logger.error('Failed HTTP query', queryId);

						rejectCallback(error);
					});

					response.on('data', function(chunk) {
						responseText = responseText + chunk;
					});

					response.on('end', function() {
						logger.debug('Completed HTTP query', queryId);

						resolveCallback(that._parseResponse(responseText));
					});
				};

				if (authenticationOptions !== null && authenticationOptions.type === 'digest') {
					var digestClient = digest(authenticationOptions.username, authenticationOptions.password, secure);

					digestClient.request(requestOptions, handleResponse);
				} else {
					var configuration = that._getConfiguration();

					var connector;

					if (secure) {
						connector = https;
					} else {
						connector = http;
					}

					var request = connector.request(requestOptions, handleResponse);

					var requestBody = that._getRequestBody(criteria);

					if (requestBody !== null) {
						request.write(requestBody);
					}

					request.end();
				}
			});
		},

		_getRequestOptions: function(criteria) {
			return { };
		},

		_getAuthenticationOptions: function(criteria) {
			var returnRef;

			var configuration = this._getConfiguration();

			if (_.isObject(configuration.authentication)) {
				returnRef = configuration.authentication;
			} else {
				returnRef = null;
			}

			return returnRef;
		},

		_getRequestBody: function(criteria) {
			return null;
		},

		_parseResponse: function(responseText) {
			return responseText;
		},

		toString: function() {
			return '[RestQueryProvider]';
		}
	});

	return RestQueryProvider;
}();