var _ = require('lodash');
var Class = require('class.extend');
var log4js = require('log4js');

var assert = require('common/lang/assert');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('common-node/network/server/endpoints/Container');

	var Container = Class.extend({
		init: function(port, path, secure) {
			assert.argumentIsOptional(port, 'port', Number);
			assert.argumentIsOptional(path, 'path', String);
			assert.argumentIsOptional(secure, 'secure', Boolean);

			var sequence = sequencer++;

			this._port = getEffectivePort(port);
			this._path = path || null;
			this._secure = secure || false;

			this._endpoints = [];
		},

		addEndpoint: function(endpoint) {
			assert.argumentIsRequired(endpoint, 'endpoint', this.getEndpointType(), this._getEndpointType().toString());

			this._endpoints.push(endpoint);

			return this;
		},

		getEndpoints: function() {
			return this._endpoints;
		},

		getEndpointType: function() {
			return this._getEndpointType();
		},

		_getEndpointType: function() {
			return null;
		},

		getPort: function() {
			return this._port;
		},

		getPath: function() {
			return this._path;
		},

		getIsSecure: function() {
			return this._secure;
		},

		toString: function() {
			return '[Container]';
		}
	});

	var sequencer = 0;

	function getEffectivePort(port) {
		var returnVal;

		if (_.isNumber(port)) {
			returnVal = port;
		} else {
			returnVal = parseInt(process.env.PORT);

			if (_.isNaN(returnVal)) {
				returnVal = 80;
			}
		}

		return returnVal;
	}

	return Container;
}();