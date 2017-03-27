const log4js = require('log4js'),
	pg = require('pg');

const promise = require('common/lang/promise');

const Client = require('./Client'),
	ClientProvider = require('./ClientProvider');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/database/postgres/PooledClientProvider');

	class PooledClientProvider extends ClientProvider {
		constructor(host, database, username, password, port, applicationName) {
			super(host, database, username, password, port, applicationName);

			this._preparedStatementMap = {};
		}

		_getClient() {
			logger.debug('Retrieving client from connection pool.');

			return promise.build((resolveCallback, rejectCallback) => {
				pg.connect(this._getConfiguration(), (err, pgClient, releaseCallback) => {
					if (err) {
						rejectCallback(err);
					} else {
						logger.debug('Retrieved client from connection pool.');

						resolveCallback(new PooledClient(pgClient, this._preparedStatementMap, releaseCallback));
					}
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

			logger.debug('Returned client to connection pool.');
		}

		toString() {
			return '[PooledClient]';
		}
	}

	return PooledClientProvider;
})();