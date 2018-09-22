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
			super({ objectMode: true, highWaterMark: 100000 });

			assert.argumentIsRequired(query, 'query', Query, 'Query');
			assert.argumentIsRequired(provider, 'provider', DynamoProvider, 'DynamoProvider');

			this._query = query;
			this._provider = provider;

			this._previous = null;
			this._queried = 0;

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

			logger.debug('Query stream started');

			const queryChunkRecursive = () => {
				if (this._previous !== null && !this._previous.startKey) {
					this._reading = false;

					logger.debug('Query stream stopping, no more results');

					this.push(null);
				} else {
					this._provider.queryChunk(this._query, this._previous)
						.then((results) => {
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

		toString() {
			return '[DynamoQueryReader]';
		}
	}

	return DynamoQueryReader;
})();