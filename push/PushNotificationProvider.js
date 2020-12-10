const log4js = require('log4js');

const assert = require('@barchart/common-js/lang/assert'), 
	is = require('@barchart/common-js/lang/is'),
	Disposable = require('@barchart/common-js/lang/Disposable');

const AdapterBase = require('./adapters/AdapterBase');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/push/PushNotificationProvider');

	/**
	 * A wrapper for the Push Notification Service.
	 *
	 * @public
	 * @param {String} protocol - The protocol of the of the Push Notification service (either http or https).
	 * @param {String} host - The hostname of the Push Notification service.
	 * @param {Number} port - The TCP port number of the Push Notification service.
	 * @param {Function} adapterClass - The notification strategy. Specifically, the constructor function for a class extending {@link AdapterBase}
	 */
	class PushNotificationProvider extends Disposable {
		constructor(protocol, host, port, adapterClass) {
			super();

			assert.argumentIsRequired(protocol, 'protocol', String);
			assert.argumentIsRequired(host, 'host', String);
			assert.argumentIsRequired(port, 'port', Number);
			assert.argumentIsRequired(adapterClass, 'adapterClass', Function);

			if (!is.extension(AdapterBase, adapterClass)) {
				throw new Error('The "adapterClazz" argument must be the constructor for a class which extends AdapterBase.');
			}
			
			this._protocol = protocol;
			this._host = host;
			this._port = port;
			this._adapterClass = adapterClass;
			this._adapter = null;
			
			this._startPromise = null;
			this._started = false;
		}

		start() {
			if (this._startPromise === null) {
				this._startPromise = Promise.resolve()
					.then(() => {
						logger.info('Push notification provider started');

						const AdapterClass = this._adapterClass;
						
						this._adapter = new AdapterClass(this._protocol, this._host, this._port);
						
						this._started = true;

						return Promise.resolve(true);
					}).catch((e) => {
						logger.error('Push notification provider failed to start', e);

						return Promise.reject(false);
					});
			}

			return this._startPromise;
		}

		/**
		 * Registers a device.
		 *
		 * @public
		 * @param {String} deviceID - a device token.
		 * @param {String} bundleID - a bundle id of the application..
		 * @param {String} userID - a user id.
		 * @param {String} realtimeUserID - a realtime user id.
		 * @returns {Promise<Object>}
		 */
		registerDevice(deviceID, bundleID, userID, realtimeUserID) {
			return Promise.resolve()
				.then(() => {
					checkStatus(this, 'registerDevice');
					return this._adapter.registerDevice(deviceID, bundleID, userID, realtimeUserID);
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
					checkStatus(this, 'sendToDevice');
					return this._adapter.sendToDevice(deviceID, notification, development);
				});
		}

		/**
		 * Sends a Push Notifications to the specific device and application.
		 *
		 * @public
		 * @param {String} deviceID - a device token.
		 * @param {String} bundleID - a bundle id of the application..
		 * @param {Object} notification - a notification object.
		 * @param {Boolean} development - sends a message in development mode.
		 * @returns {Promise<Object>}
		 */
		sendToDeviceAndApp(deviceID, bundleID, notification, development ) {
			return Promise.resolve()
				.then(() => {
					checkStatus(this, 'sendToDeviceAndApp');
					return this._adapter.sendToDeviceAndApp(deviceID, bundleID, notification, development);
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
		sendToUser(userID, bundleID, notification, development) {
			return Promise.resolve()
				.then(() => {
					checkStatus(this, 'sendToUser');
					return this._adapter.sendToUser(userID, bundleID, notification, development);
				});
		}
		
		/**
		 * Sends a Push Notifications to the realtime user.
		 *
		 * @public
		 * @param {String} realtimeUserID - a realtime user id.
		 * @param {String} bundleID - a bundle id of the application..
		 * @param {Object} notification - a notification object.
		 * @param {Boolean} development - sends a message in development mode.
		 * @returns {Promise<Object>}
		 */
		sendToRealtimeUser(realtimeUserID, bundleID, notification, development) {
			return Promise.resolve()
				.then(() => {
					checkStatus(this, 'sendToRealtimeUser');
					
					return this._adapter.sendToRealtimeUser(realtimeUserID, bundleID, notification, development);
				});
		}

		_onDispose() {
			logger.debug('Push Notification provider disposed');

			if (this._adapter) {
				this._adapter.dispose();
				this._adapter = null;
			}

			this._client = null;
		}

		toString() {
			return '[PushNotificationProvider]';
		}
	}

	function checkDispose(provider, operation) {
		if (provider.getIsDisposed()) {
			throw new Error(`Unable to perform ${operation}, the Push Notification Provider has been disposed`);
		}
	}

	function checkStatus(provider, operation) {
		checkDispose(provider, operation);

		if (provider._adapter === null) {
			throw new Error(`Unable to perform ${operation}, the Push Notification Provider has not connected to the server`);
		}
	}

	return PushNotificationProvider;
})();
