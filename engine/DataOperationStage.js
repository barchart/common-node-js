const assert = require('@barchart/common-js/lang/assert'),
	Enum = require('@barchart/common-js/lang/Enum');

module.exports = (() => {
	'use strict';

	/**
	 * An enumeration used to classify {@link DataOperation} instances.
	 *
	 * @public
	 * @extends {Enum}
	 * @param {String} code
	 * @param {Number} priority
	 */
	class DataOperationStage extends Enum {
		constructor(code, priority) {
			super(code, code);

			assert.argumentIsRequired(priority, 'priority', Number);

			this._priority = priority;
		}

		/**
		 * The relative order in which operations should be processed (lower
		 * means sooner).
		 *
		 * @public
		 * @returns {Boolean}
		 */
		get priority() {
			return this._priority;
		}

		/**
		 * An operation that should run immediately after the current operation.
		 *
		 * @public
		 * @static
		 * @returns {DataOperationStage}
		 */
		static get INTERRUPT() {
			return interrupt;
		}

		/**
		 * A normal operation.
		 *
		 * @public
		 * @static
		 * @returns {DataOperationStage}
		 */
		static get PROCESS() {
			return process;
		}

		/**
		 * Occurs after normal processing.
		 *
		 * @public
		 * @static
		 * @returns {DataOperationStage}
		 */
		static get FINALIZE() {
			return finalize;
		}

		/**
		 * Writes a new object to the database.
		 *
		 * @public
		 * @static
		 * @returns {DataOperationStage}
		 */
		static get SAVE() {
			return save;
		}

		/**
		 * Writes updated object to the database.
		 *
		 * @public
		 * @static
		 * @returns {DataOperationStage}
		 */
		static get UPDATE() {
			return update;
		}

		/**
		 * Deletes an existing object from the database.
		 *
		 * @public
		 * @static
		 * @returns {DataOperationStage}
		 */
		static get DELETE() {
			return purge;
		}

		/**
		 * Outputs results from session, after all other operations have
		 * been completed.
		 *
		 * @public
		 * @static
		 * @returns {DataOperationStage}
		 */
		static get RESULTS() {
			return results;
		}

		toString() {
			return '[DataOperationStage]';
		}
	}

	const interrupt = new DataOperationStage('INTERRUPT', -1);
	const process = new DataOperationStage('PROCESS', 0);
	const finalize = new DataOperationStage('FINALIZE', 1);
	const save = new DataOperationStage('SAVE', 2);
	const update = new DataOperationStage('UPDATE', 3);
	const purge = new DataOperationStage('DELETE', 4);
	const results = new DataOperationStage('RESULTS', 5);

	return DataOperationStage;
})();
