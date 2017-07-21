const log4js = require('log4js'),
	Stream = require('stream');

const assert = require('common/lang/assert'),
	is = require('common/lang/is');

const DynamoProvider = require('./../../DynamoProvider'),
	Table = require('./../schema/definitions/Table');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/aws/dynamo/stream/DynamoStreamWriter');

	class DynamoStreamWriter extends Stream.Writable {
		constructor(provider, table) {
			super({ objectMode: true });

			assert.argumentIsRequired(provider, 'provider', DynamoProvider, 'DynamoProvider');
			assert.argumentIsRequired(table, 'table', Table, 'Table');

			this._provider = provider;
			this._table = table;
		}

		_write(chunk, encoding, callback) {
			logger.info(chunk.toString());

			this._provider.createItems(chunk, this._table)
				.then(() => {
					callback(null);
				}).catch((e) => {
					callback(e);
				});
		}

		toString() {
			return '[DynamoStreamWriter]';
		}
	}

	return DynamoStreamWriter;
})();