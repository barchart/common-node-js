var log4js = require('log4js');
var querystring = require('querystring');

var is = require('common/lang/is');

var RestQueryProvider = require('./RestQueryProvider');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/providers/OnDemandQueryProvider');

	class OnDemandQueryProvider extends RestQueryProvider {
		constructor(configuration) {
			super(configuration);
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

		_getRequestOptions(criteria) {
			const module = this._getModule();

			if (!is.string(module) || module.length === 0) {
				throw new Error(`Request options for ${this.toString()} require a module`);
			}

			const query = Object.assign({
				module: module,
				apikey: 'ondemand',
				output: 'json'
			}, this._getStaticCriteria());

			const dynamicCriteria = this._getDynamicCriteria();

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
				hostname: 'ondemand.websol.barchart.com',
				path: '/?' + querystring.stringify(query),
				port: 80
			};
		}

		_parseResponse(responseText) {
			try {
				const response = JSON.parse(responseText);
			} catch(e) {
				logger.error('Unable to parse response as JSON', responseText);

				throw e;
			}

			const responseCode = response.status.code;

			let returnRef;

			if (responseCode === 200) {
				returnRef = response.results;
			} else if (responseCode === 204) {
				returnRef = [];
			} else {
				throw new Error('Unable to process response from Barchart OnDemand service.');
			}

			return returnRef;
		}

		_getModule() {
			const configuration = this._getConfiguration();

			let returnRef;

			if (is.string(configuration.module)) {
				returnRef = configuration.module;
			} else {
				returnRef = null;
			}

			return returnRef;
		}

		_getStaticCriteria() {
			const configuration = this._getConfiguration();

			let returnRef;

			if (is.object(configuration.staticCriteria)) {
				returnRef = configuration.staticCriteria;
			} else {
				returnRef = {};
			}

			return returnRef;
		}

		_getDynamicCriteria() {
			const configuration = this._getConfiguration();

			let returnRef;

			if (is.object(configuration.dynamicCriteria)) {
				returnRef = configuration.dynamicCriteria;
			} else {
				returnRef = {};
			}

			return returnRef;
		}

		toString() {
			return `[OnDemandQueryProvider (Module=${(this._getModule() || 'unknown')})]`;
		}
	}

	return OnDemandQueryProvider;
})();
