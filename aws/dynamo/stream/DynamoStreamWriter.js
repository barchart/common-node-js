const log4js = require('log4js'),
	Stream = require('stream');

const assert = require('common/lang/assert'),
	is = require('common/lang/is');

const DynamoProvider = require('./../../DynamoProvider'),
	Table = require('./../schema/definitions/Table');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/aws/dynamo/stream/DynamoStreamWriter');

	/**
	 * <p>
	 *     A Node.js stream {@link Writable} which accepts single records
	 *     (or an array or records) and writes them to a DynamoDB table using
	 *     {@link DynamoProvider#saveItem} (or {@link DynamoProvider#createItems}).
	 * </p>
	 * <p>
	 *     The consumer cannot control stream options and object-mode is hardcoded to
	 *     true.
	 * </p>
	 *
	 * @public
	 */
	class DynamoStreamWriter extends Stream.Writable {
		/**
		 * @public
		 * @param {Table} table - The table schema the items conform to.
		 * @param {DynamoProvider} provider - The provider used to write records.
		 */
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
				callback(e);
			});
		}

		toString() {
			return '[DynamoStreamWriter]';
		}
	}

	return DynamoStreamWriter;
})();