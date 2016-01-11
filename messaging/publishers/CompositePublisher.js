var _ = require('lodash');
var log4js = require('log4js');
var when = require('when');

var DisposableStack = require('common/collections/specialized/DisposableStack');

var Publisher = require('./../Publisher');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('messaging/CompositePublisher');

	var CompositePublisher = Publisher.extend({
		init: function(publishers) {
			this._super();

			this._publishers = publishers;
		},

		_publish: function(messageType, payload) {
			var that = this;

			return when.map(that._publishers, function(publisher) {
				return publisher.publish(messageType, payload);
			}).then(function(ignored) {
				return;
			});
		},

		_subscribe: function(messageType, handler) {
			var that = this;

			return when.map(that._publishers, function(publisher) {
				return publisher.subscribe(messageType, handler);
			}).then(function(disposables) {
				var disposableStack = new DisposableStack();

				for (var i = 0; i < disposables.length; i++) {
					disposableStack.push(disposables[i]);
				}

				return disposableStack;
			});
		},

		_onDispose: function() {
			_.forEach(this._publishers, function(publisher) {
				publisher.dispose();
			});

			this._publishers = null;
		},

		toString: function() {
			return '[CompositePublisher]';
		}
	});

	return CompositePublisher;
}();