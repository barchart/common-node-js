var _ = require('lodash');
var log4js = require('log4js');
var uuid = require('uuid');
var when = require('when');

var assert = require('common/lang/assert');
var Event = require('common/messaging/Event');
var Disposable = require('common/lang/Disposable');
var DisposableStack = require('common/collections/specialized/Disposable');

var Router = require('./Router');
var SqsProvider = require('./../../aws/SqsProvider');

module.exports = function() {
	'use strict';

	var logger = log4js.getLogger('common-node/messaging/routers/AwsRouter');

	var AwsRouter = Router.extend({
		init: function(sqsProvider) {
			assert.argumentIsRequired(sqsProvider, 'sqsProvider', SqsProvider, 'SqsProvider');

			this._super();

			this._sqsProvider = sqsProvider;

			this._pendingRequests = { };
			this._routerId = uuid.v4();

			this._disposeStack = new DisposableStack();
		},

		_start: function() {
			var that = this;

			var responseQueueName = getResponseChannel(that._routerId);

			var responseObserver = that._sqsProvider.observe(responseQueueName, function(message) {
				if (_.isString(message.id) && _.has(that._pendingRequests, message.id)) {
					var deferred = that._pendingRequests[message.id];

					delete that._pendingRequests[message.id];

					if (_.isObject(message.payload)) {
						deferred.resolve(message.payload);
					}
				}
			});

			that._disposeStack.push(responseObserver);
		},

		_canRoute: function(messageType) {
			return true;
		},


		_route: function(messageType, payload) {
			var that = this;

			var messageId = uuid.v4();

			var envelope = {
				id: messageId,
				sender: this._publisherId,
				payload: payload
			};

			var deferred = when.defer();

			that._pendingRequests[messageId] = defer;

			return that._sqsProvider.send(messageType, envelope)
				.then(function() {
					return deferred.promise;
				});
		},

		_register: function(messageType, handler) {
			var that = this;

			var registerObserver = that._sqsProvider.observe(messageType, function(message) {
				return when(handler(message))
					.then(function(response) {
						if (_.isObject(response) && _.isString(message.sender) && _.isString(message.id)) {
							var responseQueueName = getResponseChannel(message.sender);

							var envelope = {
								id: message.id,
								payload: response
							};

							that._sqsProvider.send(responseQueueName, envelope);
						}
					});
			});

			that._disposeStack.push(registerObserver);
		},

		_onDispose: function() {
			that._disposeStack.dispose();
		},

		toString: function() {
			return '[AwsRouter]';
		}
	});

	function getResponseChannel(routerId) {
		return 'response-' + this._routerId;
	}

	return AwsRouter;
}();