const log4js = require('log4js');
const querystring = require('querystring');
const attributes = require('common/lang/attributes');

const is = require('common/lang/is');

const RestQueryProvider = require('./RestQueryProvider');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/providers/DynamicRestQueryProvider');

	class DynamicRestQueryProvider extends RestQueryProvider {
		constructor(configuration) {
			super(configuration);
		}

		_getRequestOptions(criteria) {
			const configuration = this._getConfiguration();

			const dynamicCriteria = this._getDynamicCriteria();
			
			const hostname = configuration.hostname;
			const path = configuration.path || '';
			const port = configuration.port || 80;
			const method = configuration.method || 'GET';

			const query = {};

			Object.keys(dynamicCriteria)
				.forEach((key) => {
					const attribute = attributes.read(criteria, key);

					if (is.string(attribute)) {
						query[key] = attribute;
					}

					if (is.array(attribute)) {
						query[key] = attribute.join(',');
					}
				});

			return {
				method : method,
				hostname: hostname,
				path: '/' + path + '/?' + querystring.encode(query),
				port: port
			};
		}

		_getDynamicCriteria() {
			const configuration = this._getConfiguration();

			return configuration.dynamicCriteria || {};
		}

		toString() {
			return '[DynamicRestQueryProvider]';
		}
	}

	return DynamicRestQueryProvider;
})();