var _ = require('lodash');
var log4js = require('log4js');
var when = require('when');

var assert = require('common/lang/assert');
var Event = require('common/messaging/Event');
var Disposable = require('common/lang/Disposable');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('messaging/Router');

	var Router = Disposable.extend({
		init: function() {
			this._super();

			this._starting = false;
			this._started = false;
		},

		start: function() {
			var that = this;

			if (that._starting) {
				throw new Error('The publisher has already been started.');
			}

			if (that.getIsDisposed()) {
				throw new Error('The message publisher has been disposed');
			}

			that._starting = true;

			return when(that._start())
				.then(function() {
					that._started = true;
				});
		},

		_start: function() {
			return;
		},

		canRoute: function(messageType) {
			assert.argumentIsRequired(messageType, 'messageType', String);

			var that = this;

			if (!that._started) {
				throw new Error('The router has not started.');
			}

			if (that.getIsDisposed()) {
				throw new Error('The message router has been disposed');
			}

			return that._canRoute(messageType);
		},

		_canRoute: function() {
			return false;
		},

		route: function(messageType, payload) {
			assert.argumentIsRequired(messageType, 'messageType', String);
			assert.argumentIsRequired(payload, 'payload');

			var that = this;

			if (!that._started) {
				throw new Error('The router has not started.');
			}

			if (that.getIsDisposed()) {
				throw new Error('The message router has been disposed');
			}

			if (!that.canRoute(messageType)) {
				throw new Error('The message router does not support the message type.');
			}

			return when(function() {
				return that._route(messageType, payload);
			});
		},

		_route: function(messageType, payload) {
			return;
		},

		register: function(messageType, handler) {
			assert.argumentIsRequired(messageType, 'messageType', String);
			assert.argumentIsRequired(handler, 'handler', Function);

			var that = this;

			if (!that._started) {
				throw new Error('The router has not started.');
			}

			if (that.getIsDisposed()) {
				throw new Error('The message router has been disposed');
			}

			return when(function() {
				return that._register(messageType, handler);
			});
		},

		_register: function(messageType, handler) {
			return Disposable.fromAction(function() {
				return;
			});
		},

		_onDispose: function() {
			return;
		},

		toString: function() {
			return '[Router]';
		}
	});

	return Router;
}();