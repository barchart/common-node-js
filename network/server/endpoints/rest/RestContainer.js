var Container = require('./../Container');
var RestEndpoint = require('./RestEndpoint');

module.exports = function() {
	'use strict';

	var RestContainer = Container.extend({
		init: function(port, path, secure) {
			this._super(port, path, secure);
		},

		_getEndpointType: function() {
			return RestEndpoint;
		},

		toString: function() {
			return '[RestContainer]';
		}
	});

	return RestContainer;
}();