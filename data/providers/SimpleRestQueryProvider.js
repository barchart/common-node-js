var log4js = require('log4js');
var querystring = require('querystring');

var is = require('common/lang/is');

var RestQueryProvider = require('./RestQueryProvider');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/providers/SimpleRestQueryProvider');

	class SimpleRestQueryProvider extends RestQueryProvider {
		constructor(configuration) {
			super(configuration);
		}

		_getRequestOptions(criteria) {
			const configuration = this._getConfiguration();

			const hostname = configuration.hostname;
			const path = configuration.path || '';
			const query = configuration.query || {};
			const port = configuration.port || 80;

			if (!is.string(hostname) || hostname.length === 0) {
				throw new Error(`Request options for ${this.toString()} require a hostname`);
			}

			return {
				method: 'GET',
				host: hostname,
				path: '/' + path + '?' + querystring.stringify(query),
				port: port
			};
		}

		_parseResponse(responseText) {
			return JSON.parse(responseText);
		}

		toString() {
			return '[SimpleRestQueryProvider]';
		}
	}

	return SimpleRestQueryProvider;
})();