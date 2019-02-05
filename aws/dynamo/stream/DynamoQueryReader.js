const process = require('process');

const log4js = require('log4js'),
	Stream = require('stream');

const assert = require('@barchart/common-js/lang/assert');

const DynamoProvider = require('./../../DynamoProvider'),
	Query = require('./../query/definitions/Query');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/aws/dynamo/stream/DynamoQueryReader');

	/**
	 * A Node.js {@link Stream.Readable} which returns results from a DynamoDB query.
	 *
	 * @public
	 * @extends {Stream.Readable}
	 * @param {Query} query
	 * @param {DynamoProvider} provider
	 */
	class DynamoQueryReader extends Stream.Readable {
		constructor(query, provider) {
			super({ objectMode: true, highWaterMark: 10 });

			assert.argumentIsRequired(query, 'query', Query, 'Query');
			assert.argumentIsRequired(provider, 'provider', DynamoProvider, 'DynamoProvider');

			this._query = query;
			this._provider = provider;

			this._previous = null;
			this._queried = 0;

			this._reading = false;
			this._error = false;

			this._readPromise = null;
		}

		/**
		 * Returns the number of records queried (so far).
		 *
		 * @public
		 * @returns {Number}
		 */
		get queried() {
			return this._queried;
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
			if (!this._previous || !this._previous.startKey) {
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

			if (this._reading) {
				throw new Error('Unable to set start key while reading.');
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

			this._reading = true;

			logger.debug('Query stream started');

			const queryChunkRecursive = () => {
				if (this._previous !== null && !this._previous.startKey) {
					this._reading = false;

					logger.debug('Query stream stopping, no more results');

					this.push(null);
				} else {
					let startKey;

					if (this._previous !== null && this._previous.startKey) {
						startKey = this._previous.startKey;
					} else {
						startKey = null;
					}

					this._readPromise = this._provider.queryChunk(this._query, startKey)
						.then((results) => {
							this._readPromise = null;

							this._previous = results;

							if (results.results.length !== 0) {
								this._queried = this._queried + results.results.length;
								this._reading = this.push(results.results);
							}

							if (this._reading) {
								queryChunkRecursive();
							} else {
								logger.debug('Query stream paused');
							}
						}).catch((e) => {
							this._readPromise = null;

							this._reading = false;
							this._error = true;

							this.push(null);

							logger.error('Query stopping, error encountered', e);

							process.nextTick(() => this.emit('error', e));
						});
				}
			};

			queryChunkRecursive();
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
			this.pause();

			let readPromise;

			if (this._readPromise === null) {
				readPromise = Promise.resolve()
					.then(() => {
						this.push(null);
					});
			} else {
				readPromise = this._readPromise;
			}

			return readPromise.then(() => {
				return this.startKey;
			});
		}

		toString() {
			return '[DynamoQueryReader]';
		}
	}

	return DynamoQueryReader;
})();