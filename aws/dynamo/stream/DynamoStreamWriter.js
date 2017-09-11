const log4js = require('log4js'),
	Stream = require('stream');

const assert = require('@barchart/common-js/lang/assert'),
	is = require('@barchart/common-js/lang/is');

const DynamoProvider = require('./../../DynamoProvider'),
	Table = require('./../schema/definitions/Table');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/aws/dynamo/stream/DynamoStreamWriter');

	/**
	 * A Node.js stream writable which accepts single records (or
	 * arrays of records) and writes them to a DynamoDB table using the
	 * {@link DynamoProvider#saveItem} (or {@link DynamoProvider#createItems}).
	 *
	 * @public
	 * @extends {Stream.Writable}
	 * @param {Table} table - The table schema which the items conform to.
	 * @param {DynamoProvider} provider - The provider used to write records.
	 */
	class DynamoStreamWriter extends Stream.Writable {
		constructor(table, provider) {
			super({ objectMode: true });

			assert.argumentIsRequired(provider, 'provider', DynamoProvider, 'DynamoProvider');
			assert.argumentIsRequired(table, 'table', Table, 'Table');

			this._table = table;
			this._provider = provider;
		}

		_write(chunk, encoding, callback) {
			let writePromise;

			if (is.array(chunk)) {
				writePromise = this._provider.createItems(chunk, this._table);
			} else {
				writePromise = this._provider.saveItem(chunk, this._table);
			}

			writePromise.then(() => {
				callback(null);
			}).catch((e) => {
				logger.error('Failed to write chunk', chunk);

				callback(e);
			});
		}

		toString() {
			return '[DynamoStreamWriter]';
		}
	}

	return DynamoStreamWriter;
})();