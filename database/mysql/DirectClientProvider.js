const log4js = require('log4js'),
	mysql = require('mysql');

const promise = require('@barchart/common-js/lang/promise');

const Client = require('./Client'),
	ClientProvider = require('./ClientProvider');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/database/mysql/DirectClientProvider');

	/**
	 * A MySQL {@link ClientProvider} which uses a dedicated, individual connections.
	 *
	 * @public
	 * @extends {ClientProvider}
	 * @param {String} host
	 * @param {String} database
	 * @param {String} username
	 * @param {String} password
	 * @param {Number=} port
	 * @param {String=} applicationName
	 */
	class DirectClientProvider extends ClientProvider {
		constructor(host, database, username, password, port, applicationName) {
			super(host, database, username, password, port, applicationName);
		}

		_getClient() {
			const configuration = this.getConfiguration();
			const connection = mysql.createConnection(configuration);

			logger.debug('Connecting new [DirectClient] to [', configuration.host, '] [', configuration.database, ']');

			return promise.build((resolveCallback, rejectCallback) => {
				connection.connect((e) => {
					if (e) {
						logger.error('Failed to connect [DirectClient] to [', configuration.host, '] [', configuration.database, ']', e);

						rejectCallback(e);
					} else {
						const client = new DirectClient(connection);

						logger.info('Connected new [DirectClient] [', client.id, '] to [', configuration.host, '] [', configuration.database, ']');

						resolveCallback(client);
					}
				});
			});
		}

		_onDispose() {
			return;
		}

		toString() {
			return '[DirectClientProvider]';
		}
	}

	class DirectClient extends Client {
		constructor(connection) {
			super(connection, {});
		}

		_onDispose() {
			this._connection.end();
			this._connection = null;

			logger.info('Disposed [DirectClient] [', this.id, ']');
		}

		toString() {
			return '[DirectClient]';
		}
	}

	return DirectClientProvider;
})();