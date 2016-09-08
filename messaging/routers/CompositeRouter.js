var _ = require('lodash');
var log4js = require('log4js');
var when = require('when');

var assert = require('common/lang/assert');
var DisposableStack = require('common/collections/specialized/DisposableStack');

var Router = require('./Router');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('common-node/messaging/routers/CompositeRouter');

	var CompositeRouter = Router.extend({
		init: function(routers, suppressExpressions) {
			assert.argumentIsArray(routers, 'routers', Router, 'Router');

			this._super(suppressExpressions);

			this._routers = routers;
		},

		_start: function() {
			var that = this;

			return when.map(that._routers, function(routers) {
				return routers.start();
			}).then(function() {
				return true;
			});
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

			var registerPromises = _.map(that._routers, function(router) {
				return router.register(messageType, handler);
			});

			return when.all(registerPromises)
				.then(function(registrations) {
					var disposableStack = new DisposableStack();

					for (var i = 0; i < registrations.length; i++) {
						disposableStack.push(registrations[i]);
					}

					return disposableStack;
				});
		},

		_onDispose: function() {
			_.forEach(this._routers, function(router) {
				router.dispose();
			});

			this._routers = null;

			logger.debug('Composite router disposed');
		},

		toString: function() {
			return '[CompositeRouter]';
		}
	});

	return CompositeRouter;
}();