const assert = require('@barchart/common-js/lang/assert'),
	Disposable = require('@barchart/common-js/lang/Disposable');

module.exports = (() => {
	'use strict';

	class ClientProvider extends Disposable {
		constructor(host, database, username, password, port, applicationName) {
			super();

			assert.argumentIsRequired(host, 'host', String);
			assert.argumentIsRequired(database, 'database', String);
			assert.argumentIsRequired(username, 'username', String);
			assert.argumentIsRequired(password, 'password', String);
			assert.argumentIsOptional(port, 'port', Number);
			assert.argumentIsOptional(applicationName, 'applicationName', String);

			this._configuration = {
				host: host,
				port: port || 5432,
				database: database,
				user: username,
				password: password,
				application_name: applicationName || 'pg-javascript-client'
			};
		}

		getClient() {
			return Promise.resolve()
				.then(() => {
					return this._getClient();
				});
		}

		_getClient() {
			return null;
		}

		_getConfiguration() {
			return this._configuration;
		}

		toString() {
			return '[ClientProvider]';
		}
	}

	return ClientProvider;
})();