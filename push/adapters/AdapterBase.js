const assert = require('@barchart/common-js/lang/assert'),
	Disposable = require('@barchart/common-js/lang/Disposable');


module.exports = (() => {
	'use strict';

	/**
	 * The abstract definition for a Push Notification Service.
	 *
	 * @public
	 * @exported
	 * @extends {Disposable}
	 * @public
	 * @param {String} protocol - The protocol of the of the Push Notification service (either http or https).
	 * @param {String} host - The hostname of the Push Notification service.
	 * @param {Number} port - The TCP port number of the Push Notification service.
	 */
	class AdapterBase extends Disposable {
		constructor(protocol, host, port) {
			super(protocol, host, port);

			assert.argumentIsRequired(protocol, 'protocol', String);
			assert.argumentIsRequired(host, 'host', String);
			assert.argumentIsRequired(port, 'port', Number);
			
			this._host = host;
			this._port = port;
			this._protocol = protocol;
		}


		/**
		 * The hostname of the Barchart Push Notification Service.
		 *
		 * @public
		 * @returns {String}
		 */
		get host() {
			return this._host;
		}

		/**
		 * The TCP port number of the Barchart Push Notification Service.
		 *
		 * @public
		 * @returns {Number}
		 */
		get port() {
			return this._port;
		}

		/**
		 * The protocol for requests (e.g. HTTPS).
		 *
		 * @public
		 * @returns {String}
		 */
		get protocol() {
			return this._protocol;
		}
		
		registerDevice(deviceID, bundleID, userID, realtimeUserID) {
			return null;
		}

		sendToDevice(deviceID, notification, development) {
			return null;
		}

		sendToDeviceAndApp(deviceID, bundleID, notification, development) {
			return null;
		}

		sendToUser(userID, bundleID, notification, development) {
			return null;
		}

		sendToRealtimeUser(realtimeUserID, bundleID, notification, development) {
			return null;
		}

		toString() {
			return '[AdapterBase]';
		}
	}

	return AdapterBase;
})();
