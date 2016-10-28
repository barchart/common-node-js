var attributes = require('common/lang/attributes');
var log4js = require('log4js');
var mysql = require('mysql');

var is = require('common/lang/is');

var QueryProvider = require('./../QueryProvider');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/providers/MySqlQueryProvider');

	class MySqlQueryProvider extends QueryProvider {
		constructor(configuration) {
			super(configuration);
		}

		_runQuery(criteria) {
			const connection = mysql.createConnection({
				host: this._configuration.host,
				user: this._configuration.user,
				password: this._configuration.password,
				database: this._configuration.database
			});

			const configurationParameters = this._configuration.parameters;

			let parameters = [];

			if (is.array(configurationParameters)) {
				parameters = configurationParameters.map((param) => {
					return attributes.read(criteria, param);
				});
			} else if (is.string(configurationParameters)) {
				parameters = attributes.read(criteria, configurationParameters);
			}

			connection.on('error', (e) => {
				logger.error('MySql connection error (fatal)', e);
			});

			return new Promise((resolve, reject) => {
				connection.query(this._configuration.query, parameters, (e, rows) => {
					try {
						if (e) {
							logger.error('MySql query error', e);

							reject(e);
						} else {
							resolve(rows);
						}
					} finally {
						connection.end((endError) => {
							if (!is.undefined(endError)) {
								logger.error('MySql connection error (on close)', endError);
							}
						});
					}
				});
			});
		}

		toString() {
			return '[MySqlQueryProvider]';
		}
	}

	return MySqlQueryProvider;
})();
