var _ = require('lodash');
var log4js = require('log4js');
var querystring = require('querystring');

var RestQueryProvider = require('./RestQueryProvider');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('data/providers/OnDemandQueryProvider');

	var OnDemandQueryProvider = RestQueryProvider.extend({
		init: function(configuration) {
			this._super(configuration);
		},

		_getCriteriaIsValid: function(criteria) {
			var that = this;

			var dynamicCriteria = that._getDynamicCriteria();

			return _.every(dynamicCriteria, function(defaultValue, key) {
				var valueToUse;

				if (_.has(criteria, key)) {
					valueToUse = criteria[key];
				}

				if (_.isUndefined(valueToUse)) {
					valueToUse = defaultValue;
				}

				if (_.isNumber(valueToUse)) {
					valueToUse = valueToUse.toString();
				}

				if (_.isArray(valueToUse) && valueToUse.length !== 0) {
					valueToUse = valueToUse.join();
				}

				return _.isString(valueToUse) && valueToUse.length !== 0;
			});
		},

		_getRequestOptions: function(criteria) {
			var that = this;

			var module = that._getModule();

			if (!_.isString(module) || module.length === 0) {
				throw new Error('Request options for ' + that.toString() + ' require a module');
			}

			var dynamicCriteria = that._getDynamicCriteria();

			var query = _.assign({
				module: module,
				apikey: 'ondemand',
				output: 'json'
			}, that._getStaticCriteria());

			_.forOwn(dynamicCriteria, function(defaultValue, key) {
				var valueToUse;

				if (_.has(criteria, key)) {
					valueToUse = criteria[key];
				}

				if (_.isUndefined(valueToUse)) {
					valueToUse = defaultValue;
				}

				query[key] = valueToUse;
			});

			_.forOwn(query, function(value, key) {
				var stringValue;

				if (_.isArray(value)) {
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
		},

		_parseResponse: function(responseText) {
			var response = JSON.parse(responseText);
			var responseCode = response.status.code;

			var returnRef;

			if (responseCode === 200) {
				returnRef = response.results;
			} else if (responseCode === 204) {
				returnRef = [];
			} else {
				throw new Error('Unable to process response from Barchart OnDemand service.');
			}

			return returnRef;
		},

		_getModule: function() {
			var configuration = this._getConfiguration();

			var returnRef;

			if (_.isString(configuration.module)) {
				returnRef = configuration.module;
			} else {
				returnRef = null;
			}

			return returnRef;
		},

		_getStaticCriteria: function() {
			var configuration = this._getConfiguration();

			var returnRef;

			if (_.isObject(configuration.staticCriteria)) {
				returnRef = configuration.staticCriteria;
			} else {
				returnRef = {};
			}

			return returnRef;
		},

		_getDynamicCriteria: function() {
			var configuration = this._getConfiguration();

			var returnRef;

			if (_.isObject(configuration.dynamicCriteria)) {
				returnRef = configuration.dynamicCriteria;
			} else {
				returnRef = {};
			}

			return returnRef;
		},

		toString: function() {
			return '[OnDemandQueryProvider (Module=' + (this._getModule() || 'unkown') + ')]';
		}
	});

	return OnDemandQueryProvider;
}();