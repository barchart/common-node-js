var log4js = require('log4js');

var Event = require('common/messaging/Event');
var Disposable = require('common/lang/Disposable');

var Router = require('./Router');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/messaging/routers/LocalRouter');

	class LocalRouter extends Router {
		constructor(suppressExpressions) {
			super(suppressExpressions);

			this._requestHandlers = {};
		}

		_canRoute(messageType) {
			return this._requestHandlers.hasOwnProperty(messageType);
		}

		_route(messageType, payload) {
			const handler = this._requestHandlers[messageType];

			return handler(payload, messageType);
		}

		_register(messageType, handler) {
			this._requestHandlers[messageType] = handler;

			return Disposable.fromAction(() => {
				delete this._requestHandlers[messageType];
			});
		}

		_onDispose() {
			this._requestHandlers = null;

			logger.debug('Local router disposed');
		}

		toString() {
			return '[LocalRouter]';
		}
	}

	return LocalRouter;
})();
