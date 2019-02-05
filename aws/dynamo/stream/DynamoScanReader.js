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
			super({ objectMode: true, highWaterMark: 10 });

			assert.argumentIsRequired(scan, 'scan', Scan, 'Scan');
			assert.argumentIsRequired(provider, 'provider', DynamoProvider, 'DynamoProvider');

			this._scan = scan;
			this._provider = provider;

			this._previous = null;
			this._scanned = 0;

			this._started = false;
			this._stopping = false;
			this._reading = false;

			this._error = false;

			this._readPromise = null;
		}

		/**
		 * Returns the number of records scanned (so far).
		 *
		 * @public
		 * @returns {Number}
		 */
		get scanned() {
			return this._scanned;
		}

		/**
		 * Gets the location, in the Dynamo table, at which the next read will
		 * begin. If the stream has not started, or the stream has completed,
		 * a null value is returned.
		 *
		 * @public
		 * @returns {Object|null} - An object with one or two properties -- table key names and values (see {@link TableContainer#getPagingKey})
		 */
		get startKey() {
			if (!this._previous) {
				return null;
			}

			return this._previous.startKey;
		}

		/**
		 * Sets the location, in the Dynamo table, at which the next read will
		 * begin.
		 *
		 * @public
		 * @param {Object} startKey - An object with one or two properties -- table key names and values (see {@link TableContainer#getPagingKey})
		 */
		set startKey(startKey) {
			assert.argumentIsRequired(startKey, 'startKey', Object);

			if (this._started) {
				throw new Error('Once the stream has started, the start key cannot be set.');
			}

			if (!this._previous) {
				this._previous = {};
			}

			this._previous.startKey = startKey;
		}

		_read(size) {
			if (this._reading) {
				return;
			}

			if (this._error) {
				logger.error('Unable to continue reading, an error was encountered.');
				return;
			}

			if (this._started) {
				logger.debug('Scan stream resumed');
			} else {
				logger.debug('Scan stream started');

				this._started = true;
			}

			this._reading = true;

			const scanChunkRecursive = () => {
				if (this._stopping || (this._previous !== null && !this._previous.startKey)) {
					this._reading = false;

					if (this._stopping) {
						logger.debug('Scan stream stopping, stream stopped');
					} else {
						logger.debug('Scan stream stopping, no more results');
					}

					this.push(null);
				} else {
					let startKey;

					if (this._previous !== null && this._previous.startKey) {
						startKey = this._previous.startKey;
					} else {
						startKey = null;
					}

					this._readPromise = this._provider.scanChunk(this._scan, startKey)
						.then((results) => {
							this._readPromise = null;

							this._previous = results;

							if (results.results.length !== 0) {
								this._scanned = this._scanned + results.results.length;

								this.push(results.results);
							}

							if (this._reading) {
								scanChunkRecursive();
							} else {
								logger.debug('Scan stream paused');
							}
						}).catch((e) => {
							this._readPromise = null;

							this._reading = false;
							this._error = true;

							this.push(null);

							logger.error('Scan stopping, error encountered', e);

							process.nextTick(() => this.emit('error', e));
						});
				}
			};

			scanChunkRecursive();
		}

		pause() {
			this._reading = false;

			super.pause();
		}

		/**
		 * Gracefully interrupts reading. Any current reads will continue and their results
		 * will be placed onto the queue. However, once any reads that are in progress complete,
		 * no further reading will occur and the stream will end normally. Once reading has actually
		 * stopped, the returned promise resolves.
		 *
		 * @public
		 * @return {Promise<Object|null>}
		 */
		stop() {
			this._stopping = true;

			let readPromise;

			if (this._readPromise === null) {
				readPromise = Promise.resolve();
			} else {
				readPromise = this._readPromise;
			}

			return readPromise.then(() => {
				return this.startKey;
			});
		}

		toString() {
			return '[DynamoScanReader]';
		}
	}

	return DynamoScanReader;
})();
