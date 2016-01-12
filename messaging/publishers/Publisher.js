var _ = require('lodash');
var log4js = require('log4js');
var when = require('when');

var assert = require('common/lang/assert');
var Event = require('common/messaging/Event');
var Disposable = require('common/lang/Disposable');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('common-node/messaging/publishers/Publisher');

	var Publisher = Disposable.extend({
		init: function() {
			this._super();

			this._startPromise = null;
			this._started = false;
		},

		start: function() {
			var that = this;

			if (that.getIsDisposed()) {
				throw new Error('The message publisher has been disposed');
			}

			if (that._startPromise === null) {
				that._startPromise = when.try(function() {
					return that._start();
				}).then(function () {
					that._started = true;

					return that._started;
				});
			}

			return that._startPromise;
		},
		
		_start: function() {
			return;
		},
		
		publish: function(messageType, payload) {
			assert.argumentIsRequired(messageType, 'messageType', String);
			assert.argumentIsRequired(payload, 'payload', Object);

			var that = this;

			if (!that._started) {
				throw new Error('The publisher has not started.');
			}
			
			if (that.getIsDisposed()) {
				throw new Error('The message publisher has been disposed');
			}

			return when.try(function() {
				return that._publish(messageType, payload);
			});
		},

		_publish: function(messageType, payload) {
			return;
		},

		subscribe: function(messageType, handler) {
			assert.argumentIsRequired(messageType, 'messageType', String);
			assert.argumentIsRequired(handler, 'handler', Function);

			var that = this;

			if (!that._started) {
				throw new Error('The publisher has not started.');
			}
			
			if (that.getIsDisposed()) {
				throw new Error('The message publisher has been disposed');
			}

			return when.try(function() {
				return that._subscribe(messageType, handler);
			});
		},

		_subscribe: function(messageType, handler) {
			return Disposable.fromAction(function() {
				return;
			});
		},

		_onDispose: function() {
			return;
		},

		toString: function() {
			return '[Publisher]';
		}
	});

	return Publisher;
}();