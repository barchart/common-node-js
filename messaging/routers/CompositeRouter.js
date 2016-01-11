var _ = require('lodash');
var log4js = require('log4js');
var when = require('when');

var DisposableStack = require('common/collections/specialized/DisposableStack');

var Router = require('./../Router');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('messaging/CompositeRouter');

	var CompositeRouter = Router.extend({
		init: function(routers) {
			this._super();

			this._routers = routers;
		},

		_canRoute: function(messageType) {
			return _.some(this._routers, function(router) {
				return router.canRoute(messageType);
			});
		},

		_route: function(messageType, payload) {
			var that = this;

			var router = _.find(that._routers, function(router) {
				return router.canRoute(messageType);
			});

			return router.route(messageType, payload);
		},

		_register: function(messageType, handler) {
			var that = this;

			return when.map(that._routers, function(router) {
				return router.register(messageType, handler);
			}).then(function(disposables) {
				var disposableStack = new DisposableStack();

				for (var i = 0; i < disposables.length; i++) {
					disposableStack.push(disposables[i]);
				}

				return disposableStack;
			});
		},

		_onDispose: function() {
			_.forEach(this._routers, function(router) {
				router.dispose();
			});

			this._routers = null;
		},

		toString: function() {
			return '[CompositeRouter]';
		}
	});

	return CompositeRouter;
}();