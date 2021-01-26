const log4js = require('log4js'),
	pg = require('pg');

const promise = require('@barchart/common-js/lang/promise');

const Client = require('./Client'),
	ClientProvider = require('./ClientProvider');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/database/postgres/DirectClientProvider');

	/**
	 * A {@link ClientProvider} which uses a dedicated connection.
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
			logger.debug('Creating new connection.');

			return promise.build((resolveCallback, rejectCallback) => {
				const pgClient = new pg.Client(this.getConfiguration());

				pgClient.connect((err) => {
					if (err) {
						rejectCallback(err);
					} else {
						logger.debug('Connection created.');

						resolveCallback(new DirectClient(pgClient));
					}
				});
			});
		}

		_onDispose() {
			pg.end();
		}

		toString() {
			return '[DirectClientProvider]';
		}
	}

	class DirectClient extends Client {
		constructor(pgClient) {
			super(pgClient, {});
		}

		_onDispose() {
			this._pgClient.end();
			this._pgClient = null;

			logger.debug('Connection disposed');
		}

		toString() {
			return '[DirectClient]';
		}
	}

	return DirectClientProvider;
})();