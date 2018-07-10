module.exports = (() => {
	'use strict';

	/**
	 * The result of a {@link DataOperation#process} invocation.
	 *
	 * @public
	 * @param {*} - The result of the operation
	 * @param {Array<DataOperation>} - Additional data operations triggered during processing of the current operation.
	 */
	class DataOperationResult {
		constructor(operation, result, children) {
			this._operation = operation;
			this._result = result;
			this._children = children || [ ];
		}

		/**
		 * The operation which was processed.
		 *
		 * @public
		 * @returns {*}
		 */
		get operation() {
			return this._operation;
		}

		/**
		 * The operation's result.
		 *
		 * @public
		 * @returns {*}
		 */
		get result() {
			return this._result;
		}

		/**
		 * The additional data operations that were spawned during processing of the operation.
		 *
		 * @public
		 * @returns {Array<DataOperation>}
		 */
		get children() {
			return this._children;
		}

		static getInitial() {
			return new DataOperationResult(null, null, [ ]);
		}

		toString() {
			return '[DataOperationResult]';
		}
	}

	return DataOperationResult;
})();
