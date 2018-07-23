const assert = require('@barchart/common-js/lang/assert');

const DataProvider = require('./DataProvider'),
	DataOperationResult = require('./DataOperationResult'),
	DataOperationStage = require('./DataOperationStage');

module.exports = (() => {
	'use strict';
	
	/**
	 * An operation that runs within the context of a {@link DataSession}.
	 *
	 * @public
	 * @interface
	 */
	class DataOperation {
		constructor() {
			this._processing = false;
			this._processed = false;

			this._children = null;
		}

		/**
		 * Classification of the operation, helps when determining the order
		 * to process operations.
		 *
		 * @public
		 * @returns {DataOperationStage}
		 */
		get stage() {
			return DataOperationStage.PROCESS;
		}

		/**
		 * Processes the current instance and returns an array of additional
		 * {@link DataOperation} instances arising from the execution of the
		 * current instance.
		 *
		 * @public
		 * @param {DataProvider} dataProvider
		 * @param {DataProvider} session
		 * @returns {Promise}
		 */
		process(dataProvider, session) {
			return Promise.resolve()
				.then(() => {
					this._validateDataProvider(dataProvider);

					if (this._processing || this._processed) {
						throw new Error('Unable to process DataOperation, the operation is already processing.');
					}

					this._processing = true;
					this._children = [ ];

					return Promise.resolve()
						.then(() => {
							return this._process(dataProvider, session);
						}).then((result) => {
							this._processing = false;
							this._processed = true;

							const children = this._children;

							this._children = null;

							return new DataOperationResult(this, result, children);
						});
				});
		}

		/**
		 * @protected
		 * @ignore
		 * @param {DataProvider} dataProvider
		 * @returns {*}
		 */
		_process(dataProvider) {
			return;
		}

		/**
		 * Allows an operation to schedule another operation (only to be used
		 * during processing of the current operation).
		 *
		 * @protected
		 * @param {DataOperation} operation
		 */
		_spawn(operation) {
			if (!this._processing) {
				throw new Error('A new data operation can only be spawned during the processing of the operation.');
			}

			this._children.push(operation);
		}

		/**
		 * Transforms the result of the current operation, given the results of any other
		 * operations that were spawned during the current operation's processing.
		 *
		 * @public
		 * @param {DataOperationResult} currentResult
		 * @param {Array.<DataOperationResult>} }spawnResults
		 * @returns {DataOperationResult}
		 */
		transformResult(currentResult, spawnResults) {
			return new DataOperationResult(currentResult.operation, this._transformResult(currentResult.result, spawnResults.map(spawnResult => spawnResult.result)), currentResult.children));
		}

		/**
		 * @@protected
		 * @param {*} currentResult
		 * @param {Array.<*>} }spawnResults
		 * @returns {*}
		 */
		_transformResult(currentResult, spawnResults) {
			return operationResult;
		}

		/**
		 * Indicates if the operation is effectively the same as another {@link DataOperation}
		 * instance; allowing the manager to skip execution.
		 *
		 * @public
		 * @param {DataOperation=} other
		 * @returns {*}
		 */
		equals(other) {
			assert.argumentIsOptional(other, 'other', DataOperation, 'DataOperation');

			return this._equals(other);
		}

		/**
		 * Used by the operation manager to determine if a data operation is
		 * a duplicate of the previously executed operation (allowing it to
		 * be discarded).
		 *
		 * @protected
		 * @param {DataOperation=} operation
		 */
		_equals(other) {
			return other === this;
		}

		_validateDataProvider(dataProvider) {
			assert.argumentIsRequired(dataProvider, 'dataProvider', DataProvider, 'DataProvider');
		}

		toString() {
			return '[DataOperation]';
		}
	}

	return DataOperation;
})();
