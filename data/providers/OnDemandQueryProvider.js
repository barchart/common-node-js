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
			return super._getStaticCriteria() && this._getModule() !== null;
		}

		_getHostname() {
			return 'ondemand.websol.barchart.com';
		}

		_getPort() {
			return 80;
		}

		_parseResponse(responseText) {
			let response;

			try {
				response = JSON.parse(responseText);
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

			if (is.string(configuration.module) && configuration.module.length === 0) {
				returnRef = configuration.module;
			} else {
				returnRef = null;
			}

			return returnRef;
		}

		_getStaticCriteria() {
			const existing = super._getStaticCriteria();
			const module = this._getModule();

			return Object.assign({
				module: module,
				apikey: 'ondemand',
				output: 'json'
			}, existing);
		}

		toString() {
			return `[OnDemandQueryProvider (Module=${(this._getModule() || 'unknown')})]`;
		}
	}

	return OnDemandQueryProvider;
})();
