const assert = require('@barchart/common-js/lang/assert');

const DataOperationStage = require('./DataOperationStage');

module.exports = (() => {
	'use strict';

	/**
	 * A container for a {@link DataOperation}.
	 *
	 * @public
	 * @interface
	 */
	class DataOperationContainer {
		constructor(operation, stage, order) {
			assert.argumentIsOptional(stage, 'stage', DataOperationStage, 'DataOperationStage');
			assert.argumentIsOptional(order, 'order', Number);

			this._operation = operation;

			this._stage = stage || null;
			this._order = order || null;
		}

		get operation() {
			return this._operation;
		}

		get stage() {
			return this._stage;
		}

		set stage(value) {
			assert.argumentIsOptional(value, 'value', DataOperationStage, 'DataOperationStage');

			this._stage = value;
		}

		get order() {
			return this._order;
		}

		set order(value) {
			assert.argumentIsOptional(value, 'value', Number);

			this._order = value;
		}

		toString() {
			return '[DataOperationContainer]';
		}
	}

	return DataOperationContainer;
})();
