var digest = require('http-digest-client');
var http = require('http');
var https = require('https');
var log4js = require('log4js');
var querystring = require('querystring');

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

		_getCriteriaIsValid(criteria) {
			const dynamicCriteria = this._getDynamicCriteria();

			return Object.keys(dynamicCriteria)
				.every((key) => {
					const defaultValue = dynamicCriteria[key];

					let valueToUse;

					if (criteria.hasOwnProperty(key)) {
						valueToUse = criteria[key];
					}

					if (is.undefined(valueToUse)) {
						valueToUse = defaultValue;
					}

					if (is.number(valueToUse)) {
						valueToUse = valueToUse.toString();
					}

					if (is.array(valueToUse) && valueToUse.length !== 0) {
						valueToUse = valueToUse.join();
					}

					return is.string(valueToUse) && valueToUse.length !== 0;
				});
		}

		_getStaticCriteria() {
			const configuration = this._getConfiguration();

			let returnRef;

			if (is.object(configuration.staticCriteria) || is.object(configuration.criteria)) {
				returnRef = Object.assign({ }, configuration.staticCriteria || configuration.criteria);
			} else {
				returnRef = {};
			}

			return returnRef;
		}

		_getDynamicCriteria() {
			const configuration = this._getConfiguration();

			let returnRef;

			if (is.object(configuration.dynamicCriteria)) {
				returnRef = Object.assign({ }, configuration.dynamicCriteria);
			} else {
				returnRef = {};
			}

			return returnRef;
		}

		_getHostname() {
			const configuration = this._getConfiguration();

			return configuration.hostname;
		}

		_getPort() {
			const configuration = this._getConfiguration();

			return configuration.port || 80;
		}

		_getRequestOptions(criteria) {
			const configuration = this._getConfiguration();

			const hostname = this._getHostname();
			const path = configuration.path || '';
			const port = this._getPort() || 80;

			if (!is.string(hostname) || hostname.length === 0) {
				throw new Error(`Request options for ${this.toString()} require a hostname`);
			}

			const staticCriteria = this._getDynamicCriteria();
			const dynamicCriteria = this._getDynamicCriteria();

			const query = Object.assign({ }, staticCriteria);

			Object.keys(dynamicCriteria)
				.forEach((key) => {
					const defaultValue = dynamicCriteria[key];

					let valueToUse;

					if (criteria.hasOwnProperty(key)) {
						valueToUse = criteria[key];
					}

					if (is.undefined(valueToUse)) {
						valueToUse = defaultValue;
					}

					query[key] = valueToUse;
				});

			Object.keys(query)
				.forEach((key) => {
					const value = query[key];

					let stringValue;

					if (is.array(value)) {
						stringValue = value.join();
					} else {
						stringValue = value.toString();
					}

					query[key] = stringValue;
				});

			return {
				method: 'GET',
				host: hostname,
				path: '/' + path + '?' + querystring.stringify(query),
				port: port
			};
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
			let response;

			try {
				response = JSON.parse(responseText);
			} catch (e) {
				logger.error('Unable to parse response as JSON', responseText);

				throw e;
			}
		}

		toString() {
			return '[RestQueryProvider]';
		}
	}

	return RestQueryProvider;
})();