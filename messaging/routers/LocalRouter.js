var _ = require('lodash');
var log4js = require('log4js');

var Event = require('common/messaging/Event');
var Disposable = require('common/lang/Disposable');

var Router = require('./Router');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('common-node/messaging/routers/LocalRouter');

	var LocalRouter = Router.extend({
		init: function(suppressExpressions) {
			this._super(suppressExpressions);

			this._requestHandlers = {};
		},

		_canRoute: function(messageType) {
			return _.has(this._requestHandlers, messageType);
		},

		_route: function(messageType, payload) {
			var handler = this._requestHandlers[messageType];

			return handler(payload, messageType);
		},

		_register: function(messageType, handler) {
			var that = this;

			that._requestHandlers[messageType] = handler;

			return Disposable.fromAction(function() {
				delete that._requestHandlers[messageType];
			});
		},

		_onDispose: function() {
			this._requestHandlers = null;

			logger.debug('Local router disposed');
		},

		toString: function() {
			return '[LocalRouter]';
		}
	});

	return LocalRouter;
}();