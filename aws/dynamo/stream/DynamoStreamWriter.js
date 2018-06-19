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
	 * A Node.js {@link Stream.Writable} which creates or deletes DynamoDB records.
	 *
	 * @public
	 * @extends {Stream.Writable}
	 * @param {Table} table - The table schema which items must conform to.
	 * @param {DynamoProvider} provider - The provider used to write records.
	 * @param {Boolean} remove - If true, the items are deleted (instead of written) to the database.
	 */
	class DynamoStreamWriter extends Stream.Writable {
		constructor(table, provider, remove) {
			super({ objectMode: true });

			assert.argumentIsRequired(provider, 'provider', DynamoProvider, 'DynamoProvider');
			assert.argumentIsRequired(table, 'table', Table, 'Table');

			this._table = table;
			this._provider = provider;

			let delegateFactory;

			if (is.boolean(remove) && remove) {
				delegateFactory = getCreateDelegate;
			} else {
				delegateFactory = getDeleteDelegate;
			}

			this._delegateFactory = delegateFactory;
		}

		_write(chunk, encoding, callback) {
			let delegate = this._delegateFactory(chunk);

			delegate.call(this._provider, chunk, this._table)
				.then(() => {
					callback(null);
				}).catch((e) => {
					logger.error('Failed to write chunk', e);
					logger.error('Failed to write chunk', JSON.stringify((chunk || {}), null, 2));

					callback(e);
				});
		}

		toString() {
			return '[DynamoStreamWriter]';
		}
	}

	function getCreateDelegate(chunk) {
		if (is.array(chunk)) {
			return this._provider.createItems;
		} else {
			return this._provider.saveItem;
		}
	}

	function getDeleteDelegate(chunk) {
		if (is.array(chunk)) {
			return this._provider.deleteItems;
		} else {
			return this._provider.deleteItem;
		}
	}

	return DynamoStreamWriter;
})();