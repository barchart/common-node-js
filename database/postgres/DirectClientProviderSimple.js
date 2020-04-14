const log4js = require('log4js'),
	JavascriptClient = require('pg/lib/client');

const promise = require('@barchart/common-js/lang/promise');

const Client = require('./Client'),
	ClientProvider = require('./ClientProvider');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/database/postgres/DirectClientProviderSimple');

	/**
	 * Generates Postgres {@Client} instances which use JavaScript only.
	 * No native code is included. This may be slower, but it's easier
	 * to include with a webpack deployment (e.g. Lambda functions).
	 *
	 * @public
	 */
	class DirectClientProviderSimple extends ClientProvider {
		constructor(host, database, username, password, port, applicationName) {
			super(host, database, username, password, port, applicationName);
		}

		_getClient() {
			logger.debug('Creating new connection.');

			return promise.build((resolveCallback, rejectCallback) => {
				const pgClient = new JavascriptClient(this._getConfiguration());

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
			return '[DirectClientProviderSimple]';
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

	return DirectClientProviderSimple;
})();