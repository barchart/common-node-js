var digest = require('http-digest-client');
var http = require('http');
var https = require('https');
var log4js = require('log4js');

var is = require('common/lang/is');

var QueryProvider = require('./../QueryProvider');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/providers/RestQueryProvider');

	let counter = 0;

	class RestQueryProvider extends QueryProvider {
		constructor(configuration) {
			super(configuration);
		}

		_runQuery(criteria) {
			return new Promise((resolveCallback, rejectCallback) => {
				const secure = this._getConfiguration().protocol === 'https';

				const requestOptions = this._getRequestOptions(criteria);
				const authenticationOptions = this._getAuthenticationOptions(criteria);

				const queryId = ++counter;

				logger.debug('Executing HTTP query', queryId);
				logger.trace(requestOptions);

				const handleResponse = (response) => {
					response.setEncoding('utf8');

					let responseText = '';

					response.on('error', (error) => {
						logger.error('Failed HTTP query', queryId);

						rejectCallback(error);
					});

					response.on('data', (chunk) => {
						responseText = responseText + chunk;
					});

					response.on('end', () => {
						logger.debug('Completed HTTP query', queryId);

						let parsedResponse = null;
						let parseSuccess = false;

						try {
							parsedResponse = this._parseResponse(responseText);
							parseSuccess = true;
						} catch (e) {
							logger.error('Unable to parse response', e);
						}

						if (parseSuccess) {
							resolveCallback(parsedResponse);
						} else {
							rejectCallback('Unable to parse REST response');
						}
					});
				};

				if (authenticationOptions !== null && authenticationOptions.type === 'digest') {
					const digestClient = digest(authenticationOptions.username, authenticationOptions.password, secure);

					digestClient.request(requestOptions, handleResponse);
				} else {
					const configuration = this._getConfiguration();

					let connector;

					if (secure) {
						connector = https;
					} else {
						connector = http;
					}

					const request = connector.request(requestOptions, handleResponse);

					const requestBody = this._getRequestBody(criteria);

					if (requestBody !== null) {
						request.write(requestBody);
					}

					request.end();
				}
			});
		}

		_getRequestOptions(criteria) {
			return {};
		}

		_getAuthenticationOptions(criteria) {
			const configuration = this._getConfiguration();

			let returnRef;

			if (is.object(configuration.authentication)) {
				returnRef = configuration.authentication;
			} else {
				returnRef = null;
			}

			return returnRef;
		}

		_getRequestBody(criteria) {
			return null;
		}

		_parseResponse(responseText) {
			return responseText;
		}

		toString() {
			return '[RestQueryProvider]';
		}
	}

	return RestQueryProvider;
})();