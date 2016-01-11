var _ = require('lodash');
var log4js = require('log4js');
var when = require('when');

var assert = require('common/lang/assert');
var Event = require('common/messaging/Event');
var Disposable = require('common/lang/Disposable');

var Publisher = require('./publishers/Publisher');
var Router = require('./routers/Router');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('common-node/messaging/Bus');

	var Bus = Disposable.extend({
		init: function() {
			this._router = null;
			this._publisher = null;

			this._started = false;
		},

		start: function(publisher, router) {
			assert.argumentIsRequired(publisher, 'publisher', Publisher, 'Publisher');
			assert.argumentIsRequired(router, 'router', Router, 'Router');

			var that = this;

			if (that.getIsDisposed()) {
				throw new Error('The message bus has been disposed');
			}

			this._started = true;

			this._publisher = publisher;
			this._router = router;
		},

		publish: function(messageType, payload) {
			assert.argumentIsRequired(messageType, 'messageType', String);
			assert.argumentIsRequired(payload, 'payload', Object);

			var that = this;

			if (that.getIsDisposed()) {
				throw new Error('The message bus has been disposed');
			}

			return this._publisher.publish(messageType, payload);
		},

		subscribe: function(messageType, handler) {
			assert.argumentIsRequired(messageType, 'messageType', String);
			assert.argumentIsRequired(handler, 'handler', Function);

			var that = this;

			if (that.getIsDisposed()) {
				throw new Error('The message bus has been disposed');
			}

			return this._publisher.subscribe(messageType, handler);
		},

		request: function(messageType, payload) {
			assert.argumentIsRequired(messageType, 'messageType', String);
			assert.argumentIsRequired(payload, 'payload', Object);

			if (that.getIsDisposed()) {
				throw new Error('The message bus has been disposed');
			}

			return this._router.request(messageType, payload);
		},

		register: function(messageType, handler) {
			assert.argumentIsRequired(messageType, 'messageType', String);
			assert.argumentIsRequired(handler, 'handler', Function);

			if (that.getIsDisposed()) {
				throw new Error('The message bus has been disposed');
			}

			return this._router.register(messageType, handler);
		},

		_onDispose: function() {
			this._publisher.dispose();
			this._router.dispose();

			this._publisher = null;
			this._router = null;
		},

		toString: function() {
			return '[Bus]';
		}
	});

	return Bus;
}();