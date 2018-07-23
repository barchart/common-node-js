const log4js = require('log4js'),
	uuid = require('uuid');

const assert = require('@barchart/common-js/lang/assert'),
	is = require('@barchart/common-js/lang/is'),
	array = require('@barchart/common-js/lang/array'),
	PriorityQueue = require('@barchart/common-js/collections/specialized/PriorityQueue');

const DataProvider = require('./DataProvider'),
	DataOperation = require('./DataOperation'),
	DataOperationComparator = require('./DataOperationComparator'),
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
	 * @param {Function=} comparator - The comparator used to sort {@link DataOperation} instances in a {@link PriorityQueue}.
	 */
	class DataSession {
		constructor(comparator) {
			assert.argumentIsOptional(comparator, 'comparator', Function);

			this._instanceCounter = ++instance;
			this._instanceId = uuid.v4();

			this._enqueueCounter = 0;

			this._pending = new PriorityQueue(comparator || DataOperationComparator.INSTANCE);
			this._processed = [ ];
			this._userEnqueued = [ ];

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

					let operationCounter = 0;

					const results = [ ];

					let outputIndicies;

					if (this._resultTypes.length === 0) {
						outputIndicies = [ ];
					} else {
						outputIndicies = this._resultTypes.map(() => [ ]);
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

												results.push(result);

												const operationIndex = results.length - 1;

												if (this._resultTypes.length === 0) {
													const resultIndex = this._userEnqueued.findIndex(o => o === result.operation);

													if (!(resultIndex < 0)) {
														outputIndicies[resultIndex] = operationIndex;
													}
												} else {
													const resultIndex = this._resultTypes.findIndex(t => operation instanceof t);

													if (!(resultIndex < 0)) {
														outputIndicies[resultIndex].push(operationIndex);
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
							const transformedResults = results.reduceRight((resolvedResults, result, i, a) => {
								const spawnResults = result.children.map((spawnOperation) => {
									return a.find((previousResult) => previousResult.operation === spawnOperation);
								});

								resolvedResults.push(result.operation.transformResult(result, spawnResults));

								return resolvedResults;
							}, [ ]);

							const resolveOutput = (outputIndex) => {
								const reversedIndex = results.length - outputIndex - 1;

								return transformedResults[reversedIndex].result;
							};

							const output = outputIndicies.map((i) => {
								if (is.array(i)) {
									return i.map(j => resolveOutput(j));
								} else {
									return resolveOutput(i);
								}
							});

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

		if (!this._flushed) {
			this._userEnqueued.push(operation);
		}
	}

	return DataSession;
})();
