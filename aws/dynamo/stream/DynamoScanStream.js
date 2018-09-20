const log4js = require('log4js'),
	Stream = require('stream');

const assert = require('@barchart/common-js/lang/assert');

const DynamoProvider = require('./../../DynamoProvider'),
	Scan = require('./../query/definitions/Scan');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/aws/dynamo/stream/DynamoScanStream');

	/**
	 * A Node.js {@link Stream.Readable} which returns results from a DynamoDB scan.
	 *
	 * @public
	 * @extends {Stream.Readable}
	 * @param {Scan} scan
	 * @param {DynamoProvider} provider
	 */
	class DynamoScanStream extends Stream.Readable {
		constructor(scan, provider) {
			super({ objectMode: true });

			assert.argumentIsRequired(scan, 'scan', Scan, 'Scan');
			assert.argumentIsRequired(provider, 'provider', DynamoProvider, 'DynamoProvider');

			this._scan = scan;
			this._provider = provider;

			this._previous = null;
			this._scanned = 0;
		}

		_read(size) {
			const scanChunkRecursive = () => {
				this._provider.scanChunk(this._scan, this._previous)
					.then((results) => {
						this._previous = results;

						if (results.results.length !== 0) {
							this._scanned = this._scanned + results.results.length;

							if (this.push(results.results)) {
								if (this._scan.limit === null || this._scanned < this._scan.limit) {
									scanChunkRecursive();
								}
							}
						} else {
							this.push(null);
						}
					});
			};

			scanChunkRecursive();
		}

		toString() {
			return '[DynamoScanStream]';
		}
	}

	return DynamoScanStream;
})();