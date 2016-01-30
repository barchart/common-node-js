var _ = require('lodash');
var log4js = require('log4js');
var uuid = require('uuid');
var when = require('when');

var assert = require('common/lang/assert');
var Event = require('common/messaging/Event');
var Disposable = require('common/lang/Disposable');
var DisposableStack = require('common/collections/specialized/DisposableStack');

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

			this._pendingRequests = {};
			this._routerId = uuid.v4();

			this._requestHandlers = {};

			this._disposeStack = new DisposableStack();
		},

		_start: function() {
			var that = this;

			logger.debug('AWS router starting');

			return when.try(function() {
				return that._sqsProvider.start();
			}).then(function(ignored) {
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

				var responseQueueBinding = Disposable.fromAction(function() {
					that._sqsProvider.deleteQueue(responseQueueName);
				});

				that._disposeStack.push(responseQueueBinding);
				that._disposeStack.push(responseObserver);

				logger.debug('AWS router started');
			});
		},

		_canRoute: function(messageType) {
			return true;
		},

		_route: function(messageType, payload) {
			var that = this;

			logger.debug('Routing message to AWS:', messageType);
			logger.trace(payload);

			var messageId = uuid.v4();

			var envelope = {
				id: messageId,
				sender: that._routerId,
				payload: payload
			};

			var deferred = when.defer();

			that._pendingRequests[messageId] = deferred;

			return that._sqsProvider.send(messageType, envelope)
				.then(function() {
					return deferred.promise;
				});
		},

		_register: function(messageType, handler) {
			var that = this;

			logger.debug('Registering AWS handler for:', messageType);

			var registerObserver = that._sqsProvider.observe(messageType, function(message) {
				if (!_.isString(message.id) || !_.isString(message.sender) || !_.isObject(message.payload)) {
					logger.warn('Dropping malformed request received from SQS queue (' + messageType + ').');
					return;
				}

				return when.try(function() {
					return handler(message.payload);
				}).then(function(response) {
					var responseQueueName = getResponseChannel(message.sender);

					var envelope = {
						id: message.id,
						payload: response || {}
					};

					return that._sqsProvider.send(responseQueueName, envelope);
				}).catch(function(e) {
					logger.error('Request processing failed. Unable to respond.', e);
				});
			});

			that._requestHandlers[messageType] = registerObserver;

			return registerObserver;
		},

		_onDispose: function() {
			var that = this;

			that._disposeStack.dispose();

			logger.debug('AWS router disposed');
		},

		toString: function() {
			return '[AwsRouter]';
		}
	});

	function getResponseChannel(routerId) {
		return 'response-' + routerId;
	}

	return AwsRouter;
}();