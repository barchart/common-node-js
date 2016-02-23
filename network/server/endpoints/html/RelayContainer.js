var _ = require('lodash');
var when = require('when');

var assert = require('common/lang/assert');

var Container = require('./../Container');
var RelayEndpoint = require('./RelayEndpoint');

module.exports = function() {
	'use strict';

	var RelayContainer = Container.extend({
		init: function(port, path, secure) {
			this._super(port, path, secure);
		},

		_getEndpointType: function() {
			return RelayEndpoint;
		},

		toString: function() {
			return '[RelayContainer]';
		}
	});

	return RelayContainer;
}();