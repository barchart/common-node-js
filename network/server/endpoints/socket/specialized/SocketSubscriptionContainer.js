var Container = require('./../../Container');
var SocketSubscriptionEndpoint = require('./SocketSubscriptionEndpoint');

module.exports = function() {
	'use strict';

	var SocketSubscriptionContainer = Container.extend({
		init: function(port, path, secure) {
			this._super(port, path, secure);
		},

		_getEndpointType: function() {
			return SocketSubscriptionEndpoint;
		},

		toString: function() {
			return '[SocketSubscriptionContainer]';
		}
	});

	return SocketSubscriptionContainer;
}();