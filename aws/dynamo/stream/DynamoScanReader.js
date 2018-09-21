const process = require('process');

const log4js = require('log4js'),
	Stream = require('stream');

const assert = require('@barchart/common-js/lang/assert');

const DynamoProvider = require('./../../DynamoProvider'),
	Scan = require('./../query/definitions/Scan');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/aws/dynamo/stream/DynamoScanReader');

	/**
	 * A Node.js {@link Stream.Readable} which returns results from a DynamoDB scan.
	 *
	 * @public
	 * @extends {Stream.Readable}
	 * @param {Scan} scan
	 * @param {DynamoProvider} provider
	 */
	class DynamoScanReader extends Stream.Readable {
		constructor(scan, provider) {
			super({ objectMode: true });

			assert.argumentIsRequired(scan, 'scan', Scan, 'Scan');
			assert.argumentIsRequired(provider, 'provider', DynamoProvider, 'DynamoProvider');

			this._scan = scan;
			this._provider = provider;

			this._previous = null;
			this._scanned = 0;

			this._reading = false;
			this._error = false;
		}

		_read(size) {
			if (this._reading) {
				return;
			}

			if (this._error) {
				logger.error('Unable to continue reading, an error was encountered.');
				return;
			}

			this._reading = true;

			const scanChunkRecursive = () => {
				this._provider.scanChunk(this._scan, this._previous)
					.then((results) => {
						this._previous = results;

						if (results.results.length !== 0) {
							this._scanned = this._scanned + results.results.length;
							this._reading = this.push(results.results);

							if (this._reading) {
								scanChunkRecursive();
							}
						} else {
							this._reading = false;

							this.push(null);
						}
					}).catch((e) => {
						this._reading = false;
						this._error = true;

						this.push(null);

						logger.error('Scan stopping, error encountered', e);

						process.nextTick(() => this.emit('error', e));
					});
			};

			scanChunkRecursive();
		}

		toString() {
			return '[DynamoScanReader]';
		}
	}

	return DynamoScanReader;
})();