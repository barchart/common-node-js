const log4js = require('log4js');

const assert = require('@barchart/common-js/lang/assert'),
	Enum = require('@barchart/common-js/lang/Enum');

const EndpointBuilder = require('@barchart/common-js/api/http/builders/EndpointBuilder'),
	Gateway = require('@barchart/common-js/api/http/Gateway'),
	ProtocolType = require('@barchart/common-js/api/http/definitions/ProtocolType'),
	VerbType = require('@barchart/common-js/api/http/definitions/VerbType');

const AdapterBase = require('./AdapterBase');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/push/adapters/AdapterFcm');

	/**
	 * An adapter for FCM Push Notifications service.
	 *
	 * @public
	 * @param {String} protocol - The protocol of the of the Push Notification service (either http or https).
	 * @param {String} host - The hostname of the Push Notification service.
	 * @param {Number} port - The TCP port number of the Push Notification service.
	 */
	class AdapterFcm extends AdapterBase {
		constructor(protocol, host, port) {
			super(protocol, host, port);

			assert.argumentIsRequired(protocol, 'protocol', String);
			assert.argumentIsRequired(host, 'host', String);
			assert.argumentIsRequired(port, 'port', Number);

			const protocolType = Enum.fromCode(ProtocolType, protocol.toUpperCase());

			this._sendNotificationEndpoint = EndpointBuilder.for('send-notification', 'send notification')
				.withVerb(VerbType.POST)
				.withProtocol(protocolType)
				.withHost(host)
				.withPort(port)
				.withPathBuilder((pb) =>
					pb.withLiteralParameter('version', 'v1')
						.withLiteralParameter('fcm', 'fcm')
						.withLiteralParameter('sendNotification', 'sendNotification')
				)
				.withBody()
				.endpoint;

			this._registerDeviceEndpoint = EndpointBuilder.for('register-device', 'register device')
				.withVerb(VerbType.POST)
				.withProtocol(protocolType)
				.withHost(host)
				.withPort(port)
				.withPathBuilder((pb) =>
					pb.withLiteralParameter('version', 'v1')
						.withLiteralParameter('fcm', 'fcm')
						.withLiteralParameter('registerDevice', 'registerDevice')
				)
				.withBody()
				.endpoint;
		}

		/**
		 * Registers a device to receive push notifications.
		 *
		 * @public
		 * @param {String} deviceID - a device id.
		 * @param {String} bundleID - a bundle id of the application..
		 * @param {String} userID - a user id.
		 * @param {String} realtimeUserID - a realtime user id.
		 * @param {String} tokenID - a FCM token id.
		 * @returns {Promise<Object>}
		 */
		registerDevice(deviceID, bundleID, userID, realtimeUserID, tokenID) {
			return Promise.resolve()
				.then(() => {
					assert.argumentIsRequired(deviceID, 'deviceID', String);
					assert.argumentIsRequired(bundleID, 'bundleID', String);
					assert.argumentIsRequired(tokenID, 'bundleID', String);
					assert.argumentIsRequired(userID, 'userID', String);
					assert.argumentIsRequired(realtimeUserID, 'realtimeUserID', String);

					return Gateway.invoke(this._registerDeviceEndpoint, {
						deviceID: deviceID,
						bundleID: bundleID,
						realtimeUserID: realtimeUserID,
						userID: userID,
						tokeID: tokenID,
					});
				});
		}

		/**
		 * Sends a Push Notifications to the device.
		 *
		 * @public
		 * @param {String} deviceID - a device token.
		 * @param {Object} notification - a notification object.
		 * @param {Boolean} development - sends a message in development mode.
		 * @returns {Promise<Object>}
		 */
		sendToDevice(deviceID, notification, development ) {
			return Promise.resolve()
				.then(() => {
					assert.argumentIsRequired(deviceID, 'deviceID', String);
					assert.argumentIsRequired(notification, 'notification', Object);
					assert.argumentIsRequired(notification.title, 'notification.title', String);
					assert.argumentIsRequired(notification.body, 'notification.body', String);
					assert.argumentIsOptional(development, 'development', Boolean);

					return Gateway.invoke(this._sendNotificationEndpoint, {
						deviceID: deviceID,
						notification: notification,
						development: development
					});
				});
		}

		/**
		 * Sends a Push Notifications to the specific application.
		 *
		 * @public
		 * @param {String} bundleID - a bundle id of the application.
		 * @param {Object} notification - a notification object.
		 * @param {Boolean} development - sends a message in development mode.
		 * @returns {Promise<Object>}
		 */
		sendToApp(bundleID, notification, development ) {
			return Promise.resolve()
				.then(() => {
					assert.argumentIsRequired(bundleID, 'bundleID', String);
					assert.argumentIsRequired(notification, 'notification', Object);
					assert.argumentIsRequired(notification.title, 'notification.title', String);
					assert.argumentIsRequired(notification.body, 'notification.body', String);
					assert.argumentIsOptional(development, 'development', Boolean);

					return Gateway.invoke(this._sendNotificationEndpoint, {
						bundleID: bundleID,
						notification: notification,
						development: development
					});
				});
		}

		/**
		 * Sends a Push Notifications to the user.
		 *
		 * @public
		 * @param {String} userID - a user id.
		 * @param {String} bundleID - a bundle id of the application.
		 * @param {Object} notification - a notification object.
		 * @param {Boolean} development - sends a message in development mode.
		 * @returns {Promise<Object>}
		 */
		sendToUser(userID, bundleID, notification, development ) {
			return Promise.resolve()
				.then(() => {
					assert.argumentIsRequired(userID, 'userID', String);
					assert.argumentIsRequired(bundleID, 'bundleID', String);
					assert.argumentIsRequired(notification, 'notification', Object);
					assert.argumentIsRequired(notification.title, 'notification.title', String);
					assert.argumentIsRequired(notification.body, 'notification.body', String);
					assert.argumentIsOptional(development, 'development', Boolean);

					return Gateway.invoke(this._sendNotificationEndpoint, {
						userID: userID,
						bundleID: bundleID,
						notification: notification,
						development: development
					});
				});
		}

		/**
		 * Sends a Push Notifications to the realtime user.
		 *
		 * @public
		 * @param {String} realtimeUserID - a realtime user id.
		 * @param {String} bundleID - a bundle id of the application.
		 * @param {Object} notification - a notification object.
		 * @param {Boolean} development - sends a message in development mode.
		 * @returns {Promise<Object>}
		 */
		sendToRealtimeUser(realtimeUserID, bundleID, notification, development ) {
			return Promise.resolve()
				.then(() => {
					assert.argumentIsRequired(realtimeUserID, 'realtimeUserID', String);
					assert.argumentIsRequired(bundleID, 'bundleID', String);
					assert.argumentIsRequired(notification, 'notification', Object);
					assert.argumentIsRequired(notification.title, 'notification.title', String);
					assert.argumentIsRequired(notification.body, 'notification.body', String);
					assert.argumentIsOptional(development, 'development', Boolean);

					return Gateway.invoke(this._sendNotificationEndpoint, {
						realtimeUserID: realtimeUserID,
						bundleID: bundleID,
						notification: notification,
						development: development
					});
				});
		}

		/**
		 * Sends a Push Notifications to the token.
		 *
		 * @public
		 * @param {String} tokenID - a FCM token.
		 * @param {Object} notification - a notification object.
		 * @param {Boolean} development - sends a message in development mode.
		 * @returns {Promise<Object>}
		 */
		sendToToken(tokenID, notification, development ) {
			return Promise.resolve()
				.then(() => {
					assert.argumentIsRequired(tokenID, 'tokenID', String);
					assert.argumentIsRequired(notification, 'notification', Object);
					assert.argumentIsRequired(notification.title, 'notification.title', String);
					assert.argumentIsRequired(notification.body, 'notification.body', String);
					assert.argumentIsOptional(development, 'development', Boolean);

					return Gateway.invoke(this._sendNotificationEndpoint, {
						tokenID: tokenID,
						notification: notification,
						development: development
					});
				});
		}

		_onDispose() {
			logger.debug('Adapter FCM disposed');

			this._client = null;
		}

		toString() {
			return '[AdapterFcm]';
		}
	}

	return AdapterFcm;
})();
