const log4js = require('log4js'),
	pg = require('pg');

const promise = require('@barchart/common-js/lang/promise');

const Client = require('./Client'),
	ClientProvider = require('./ClientProvider');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/database/postgres/PooledClientProvider');

	/**
	 * A Postgres {@link ClientProvider} which uses a a connection pool.
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
	class PooledClientProvider extends ClientProvider {
		constructor(host, database, username, password, port, applicationName) {
			super(host, database, username, password, port, applicationName);

			this._preparedStatementMap = {};
		}

		_getClient() {
			return promise.build((resolveCallback, rejectCallback) => {
				const configuration = this.getConfiguration();

				logger.debug('Creating new [PooledClient] for [', configuration.host, '] [', configuration.database, ']');

				pg.connect(this.getConfiguration(), (err, pgClient, releaseCallback) => {
					if (err) {
						rejectCallback(err);
						return;
					}

					const client = new PooledClient(pgClient, this._preparedStatementMap, releaseCallback);

					logger.info('Created new [PooledClient] [', client.id, '] for [', configuration.host, '] [', configuration.database, ']');

					resolveCallback(client);
				});
			});
		}

		_onDispose() {
			pg.end();
		}

		toString() {
			return '[PooledClientProvider]';
		}
	}

	class PooledClient extends Client {
		constructor(pgClient, preparedStatementMap, releaseCallback) {
			super(pgClient, preparedStatementMap);

			this._releaseCallback = releaseCallback;
		}

		_onDispose() {
			this._releaseCallback();

			this._pgClient = null;
			this._releaseCallback = null;

			logger.info('Disposed [PooledClient] [', this.id, ']');
		}

		toString() {
			return '[PooledClient]';
		}
	}

	return PooledClientProvider;
})();