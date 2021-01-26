const log4js = require('log4js'),
	pg = require('pg');

const promise = require('@barchart/common-js/lang/promise');

const Client = require('./Client'),
	ClientProvider = require('./ClientProvider');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/database/postgres/DirectClientProvider');

	/**
	 * A {@link ClientProvider} which uses a dedicated connections to the
	 * Postgres database.
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
			return promise.build((resolveCallback, rejectCallback) => {
				const configuration = this.getConfiguration()
				const pgClient = new pg.Client(configuration);

				logger.debug('Connecting new [ DirectClient ] to [', configuration.host, '] [', configuration.database, ']');

				pgClient.connect((err) => {
					if (err) {
						rejectCallback(err);
					} else {
						logger.info('Connected new [ DirectClient ] to [', configuration.host, '] [', configuration.database, ']');

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