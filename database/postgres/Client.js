const log4js = require('log4js');

const assert = require('@barchart/common-js/lang/assert'),
	 Disposable = require('@barchart/common-js/lang/Disposable'),
	 is = require('@barchart/common-js/lang/is'),
	 promise = require('@barchart/common-js/lang/promise');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/database/postgres/Client');

	let queryCounter = 0;

	class Client extends Disposable {
		constructor(pgClient, preparedStatementMap) {
			super();

			assert.argumentIsRequired(pgClient, 'pgClient');
			assert.argumentIsRequired(preparedStatementMap, 'preparedStatementMap');

			this._pgClient = pgClient;
			this._preparedStatementMap = preparedStatementMap;
		}

		query(query, parameters, name) {
			return Promise.resolve()
				.then(() => {
					assert.argumentIsRequired(query, 'query', String);
					assert.argumentIsOptional(name, 'name', String);

					return promise.build((resolveCallback, rejectCallback) => {
						const queryObject = {
							values: parameters || []
						};

						if (is.string(name)) {
							queryObject.name = name;

							if (!this._preparedStatementMap.hasOwnProperty(name)) {
								this._preparedStatementMap[name] = query;

							}

							queryObject.text = this._preparedStatementMap[name];
						} else {
							queryObject.text = query;
						}

						queryCounter = queryCounter + 1;

						const queryCount = queryCounter;

						logger.debug('Executing query', queryCount);
						logger.trace('Executing query', queryCount, 'with:', queryObject);

						this._pgClient.query(queryObject, (err, result) => {
							if (err) {
								logger.debug('Query', queryCount, 'failed');

								rejectCallback(err);
							} else {
								logger.debug('Query', queryCount, 'finished');

								resolveCallback(result);
							}
						});
					});
				});
		}

		toString() {
			return '[Client]';
		}
	}

	return Client;
})();