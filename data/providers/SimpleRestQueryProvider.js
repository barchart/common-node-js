var _ = require('lodash');
var log4js = require('log4js');
var querystring = require('querystring');

var RestQueryProvider = require('./RestQueryProvider');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('data/providers/SimpleRestQueryProvider');

	var SimpleRestQueryProvider = RestQueryProvider.extend({
		init: function(configuration) {
			this._super(configuration);
		},

		_getRequestOptions: function(criteria) {
			var configuration = this._getConfiguration();

			var hostname = configuration.hostname;
			var path = configuration.path || '';
			var query = configuration.query || { };
			var port = configuration.port || 80;

			if (!_.isString(hostname) || hostname.length === 0) {
				throw new Error('Request options for ' + this.toString() + ' require a hostname');
			}

			return {
				method: 'GET',
				host: hostname,
				path: '/' + path + '?' + querystring.stringify(query),
				port: port
			};
		},

		_parseResponse: function(responseText) {
			return JSON.parse(responseText);
		},

		toString: function() {
			return '[SimpleRestQueryProvider]';
		}
	});

	return SimpleRestQueryProvider;
}();