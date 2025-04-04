const assert = require('@barchart/common-js/lang/assert'),
	Disposable = require('@barchart/common-js/lang/Disposable');

module.exports = (() => {
	'use strict';

	/**
	 * An abstract contract for generating MySQL {@link Client} instances.
	 *
	 * @public
	 * @abstract
	 * @param {String} host
	 * @param {String} database
	 * @param {String} username
	 * @param {String} password
	 * @param {Number=} port
	 * @param {String=} applicationName
	 * @param {String=} charset
	 */
	class ClientProvider extends Disposable {
		constructor(host, database, username, password, port, applicationName, charset) {
			super();

			assert.argumentIsRequired(host, 'host', String);
			assert.argumentIsRequired(database, 'database', String);
			assert.argumentIsRequired(username, 'username', String);
			assert.argumentIsRequired(password, 'password', String);
			assert.argumentIsOptional(port, 'port', Number);
			assert.argumentIsOptional(applicationName, 'applicationName', String);
			assert.argumentIsOptional(charset, 'charset', String);

			this._configuration = {
				host: host,
				port: port || 3306,
				database: database,
				user: username,
				password: password,
				multipleStatements: true
			};

			if (charset) {
				this._configuration.charset = charset;
			}
		}

		/**
		 * Creates a new Postgres {@link Client} instance.
		 *
		 * @public
		 * @returns {Promise<Client>}
		 */
		async getClient() {
			return Promise.resolve()
				.then(() => {
					if (this.getIsDisposed()) {
						return Promise.reject(`Unable to get MySQL client, the ${this.toString()} has been disposed`);
					}

					return this._getClient();
				});
		}

		/**
		 * @protected
		 * @returns {Client|Promise<Client>}
		 */
		_getClient() {
			return null;
		}

		/**
		 * Returns the database configuration (e.g. host, port, etc).
		 *
		 * @public
		 * @returns {Object}
		 */
		getConfiguration() {
			return Object.assign({ }, this._configuration);
		}

		toString() {
			return '[ClientProvider]';
		}
	}

	return ClientProvider;
})();