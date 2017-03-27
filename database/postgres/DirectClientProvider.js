var log4js = require('log4js');
var pg = require('pg');

var promise = require('common/lang/promise');

var Client = require('./Client');
var ClientProvider = require('./ClientProvider');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/database/postgres/DirectClientProvider');

	class DirectClientProvider extends ClientProvider {
		constructor(host, database, username, password, port, applicationName) {
			super(host, database, username, password, port, applicationName);
		}

		_getClient() {
			logger.debug('Creating new connection.');

			return promise.build((resolveCallback, rejectCallback) => {
				const pgClient = new pg.Client(this._getConfiguration());

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