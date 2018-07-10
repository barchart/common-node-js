const log4js = require('log4js'),
	uuid = require('uuid');

const assert = require('@barchart/common-js/lang/assert'),
	is = require('@barchart/common-js/lang/is'),
	array = require('@barchart/common-js/lang/array'),
	PriorityQueue = require('@barchart/common-js/collections/specialized/PriorityQueue'),
	promise = require('@barchart/common-js/lang/promise');

const DataProvider = require('./DataProvider'),
	DataOperation = require('./DataOperation'),
	DataOperationResult = require('./DataOperationResult');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('portfolio-common/engine/DataSession');

	let instance = 0;

	/**
	 * The manager for {@link DataOperation} execution. This should be a very short-lived
	 * object -- quickly adding operations, then flushing, then discarding.
	 *
	 * @public
	 * @param {Function} comparator - The comparator used to sort {@link DataOperation} instances in a {@link PriorityQueue}.
	 */
	class DataSession {
		constructor(comparator) {
			this._instanceCounter = ++instance;
			this._instanceId = uuid.v4();

			this._enqueueCounter = 0;

			this._pending = new PriorityQueue(comparator);
			this._processed = [ ];
			this._resultTypes = [ ];

			this._flushed = false;
		}

		/**
		 * Overrides default behavior for flush results. If supplied, the result of
		 * any {@link DataOperation} with the matching type will be returned when
		 * the session flushes.
		 *
		 * @public
		 * @param {Function} type
		 * @returns {DataSession}
		 */
		withResultType(type) {
			assert.argumentIsValid(type, 'type', x => is.extension(DataOperation, type), 'inherits DataOperation');

			this._resultTypes.push(type);
			this._resultTypes = array.unique(this._resultTypes);

			return this;
		}

		/**
		 * Adds a new {@link DataOperation} and returns the current instance.
		 *
		 * @public
		 * @param {@DataOperation} operation
		 * @returns {DataSession}
		 */
		withOperation(operation) {
			assert.argumentIsRequired(operation, 'operation', DataOperation, 'DataOperation');

			if (this._flushed) {
				throw new Error('Unable to add operation to session, it has been flushed.');
			}

			enqueue.call(this, operation);

			return this;
		}

		/**
		 * Processes all the {@link DataOperation} instances held within the session.
		 *
		 * @public
		 * @param {DataProvider} dataProvider
		 * @returns {Promise}
		 */
		flush(dataProvider) {
			return Promise.resolve()
				.then(() => {
					assert.argumentIsRequired(dataProvider, 'dataProvider', DataProvider, 'DataProvider');

					if (this._flushed) {
						throw new Error('Session [', this._instanceCounter, '] has already been flushed.');
					}

					this._flushed = true;

					logger.info('Session [', this._instanceCounter, '] flush starting [', this._instanceId, ']');

					if (this._pending.empty()) {
						logger.warn('Session [', this._instanceCounter, '] has no operations.');
					}

					let userEnqueuedCount = this._enqueueCounter;
					let operationCounter = 0;

					let output;

					if (this._resultTypes.length === 0) {
						output = [];
					} else {
						output = this._resultTypes.map(() => [ ]);
					}

					const flushRecursive = (previousResult) => {
						return Promise.resolve()
							.then(() => {
								let processPromise;

								if (this._pending.empty()) {
									processPromise = Promise.resolve(previousResult);
								} else {
									let operation = null;
									let operationCount;

									while (operation === null && !this._pending.empty()) {
										const candidate = this._pending.dequeue();

										operationCount = ++operationCounter;

										if (candidate.equals(previousResult.operation)) {
											logger.debug('Session [', this._instanceCounter, '] operation [', operationCount, '][', candidate.toString() ,'] discarded as duplicate.');
										} else {
											operation = candidate;
										}
									}

									if (operation === null) {
										processPromise = Promise.resolve(previousResult);
									} else {
										this._processed.push(operation);

										logger.debug('Session [', this._instanceCounter, '] operation [', operationCount, '][', operation.toString() ,'] starting.');

										processPromise = operation.process(dataProvider, this._instanceId)
											.then((result) => {
												logger.debug('Session [', this._instanceCounter, '] operation [', operationCount, '][', operation.toString() ,'] complete.');

												if (this._resultTypes.length === 0) {
													if (!(operation.enqueueOrder > userEnqueuedCount)) {
														const outputIndex = operation.enqueueOrder - 1;

														output[outputIndex] = result.result;
													}
												} else {
													const resultTypeIndex = this._resultTypes.findIndex(t => operation instanceof t);

													if (!(resultTypeIndex < 0)) {
														output[resultTypeIndex].push(result.result);
													}
												}

												result.children.forEach(operation => enqueue.call(this, operation));

												return result;
											});
									}

									processPromise = processPromise.then((result) => {
										return flushRecursive(result);
									});
								}

								return processPromise;
							});
					};

					return flushRecursive(DataOperationResult.getInitial())
						.then(() => {
							logger.info('Session [', this._instanceCounter, '] flush finished [', this._instanceId, ']');

							if (output.length === 1) {
								return output[0];
							} else {
								return output;
							}
						});
				});
		}

		toString() {
			return '[DataSession]';
		}
	}

	function enqueue(operation) {
		operation.enqueueOrder = ++this._enqueueCounter;

		this._pending.enqueue(operation);
	}

	return DataSession;
})();
